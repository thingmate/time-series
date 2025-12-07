import { Path, type PathInput } from '@xstd/path';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { TimeSeries } from '../../time-series.ts';
import { normalizeTimeSeriesDeleteOptions } from '../../types/methods/delete/normalized-time-series-delete-options.ts';
import { type TimeSeriesDeleteOptions } from '../../types/methods/delete/time-series-delete-options.ts';
import { normalizeTimeSeriesSelectOptions } from '../../types/methods/select/normalized-time-series-select-options.ts';
import { type TimeSeriesSelectOptions } from '../../types/methods/select/time-series-select-options.ts';
import { type TimeSeriesTimeRange } from '../../types/time-range/time-series-time-range.ts';
import { sortTimeSeriesEntries } from '../../types/time-series-entry/sort-time-series-entries.ts';
import { type TimeSeriesEntry } from '../../types/time-series-entry/time-series-entry.ts';
import { binarySearch } from './helpers.private/binary-search.ts';
import { GrowableBuffer } from './helpers.private/growable-buffer.ts';

/* FUNCTIONS */

/* CONSTANTS */

const QX_TIME_BUCKET_TIME_BYTE_LENGTH = 8;
const QX_TIME_BUCKET_VALUE_BYTE_LENGTH = 8;
const QX_TIME_BUCKET_ENTRY_BYTE_LENGTH =
  QX_TIME_BUCKET_TIME_BYTE_LENGTH + QX_TIME_BUCKET_VALUE_BYTE_LENGTH;

/* TYPES */

export interface QxTimeBucketFlushOptions {
  readonly unload?: boolean;
}

interface RequireFlush {
  (): void;
}

/* CLASS */

export class QxTimeBucket extends TimeSeries<number> {
  /*
  TODO: optimizations:
  - if only push at the end => append to file instead of writing it all
  - if only delete at the end => trunc file instead of writing it all
   */
  static readonly #autoFlushTime: number = 1000;
  static readonly #autoUnloadTime: number = 5000;

  /* TIME RANGE */

  static readonly #timeRange: number = 512;

  static get timeRange(): number {
    return this.#timeRange;
  }

  static getIndexFromFilePath(filePath: PathInput): number {
    const index: number = Number(Path.of(filePath).stemAndExt().stem);

    if (!Number.isSafeInteger(index)) {
      throw new Error(`Invalid index: ${index}`);
    }

    return index;
  }

  static getIndexFromTime(time: number): number {
    return Math.floor(time / QxTimeBucket.#timeRange);
  }

  static getTimeFromIndex(index: number): number {
    console.assert(Number.isSafeInteger(index));
    return index * QxTimeBucket.#timeRange;
  }

  /* MISC */

  static fromFilePath(filePath: PathInput): QxTimeBucket {
    return new QxTimeBucket(Path.of(filePath).dirname(), this.getIndexFromFilePath(filePath));
  }

  static readonly sortFnc = (a: QxTimeBucket, b: QxTimeBucket): number => {
    return a.#index - b.#index;
  };

  readonly #path: Path;

  readonly #index: number;
  readonly #from: number; // computed
  readonly #to: number; // computed

  #queue: Promise<any>;

  #data: GrowableBuffer | undefined;

  #requireFlush: boolean;

  #autoFlushTimer: any;
  #autoUnloadTimer: any;

  constructor(dirPath: PathInput, index: number) {
    super();

    this.#path = Path.of(dirPath).concat(`${index}.bucket`);

    this.#index = index;
    this.#from = QxTimeBucket.getTimeFromIndex(this.#index);
    this.#to = QxTimeBucket.getTimeFromIndex(this.#index + 1);

    this.#queue = Promise.resolve();

    this.#requireFlush = false;
  }

  get index(): number {
    return this.#index;
  }

  get from(): number {
    return this.#from;
  }

  get to(): number {
    return this.#to;
  }

  isTimeInRange(time: number): boolean {
    return this.#from <= time && time < this.#to;
  }

  throwIfTimeOutOfRange(time: number): void {
    if (!this.isTimeInRange(time)) {
      throw new RangeError(`Time out-of-range: ${time}, expected: [${this.#from}, ${this.#to}[.`);
    }
  }

  #run<GReturn>(task: () => PromiseLike<GReturn> | GReturn): Promise<GReturn> {
    return (this.#queue = this.#queue.then(task, task));
  }

  /* LOAD/SAVE DATA */

  #startAutoFlushTimer(): void {
    this.#stopAutoUnloadTimer();
    this.#autoFlushTimer = setTimeout((): void => {
      this.#autoFlushTimer = undefined;
      this.flush({ unload: false }).catch(reportError);
    }, QxTimeBucket.#autoFlushTime);
  }

  #stopAutoFlushTimer(): void {
    if (this.#autoFlushTimer !== undefined) {
      clearTimeout(this.#autoFlushTimer);
      this.#autoFlushTimer = undefined;
    }
  }

  #startAutoUnloadTimer(): void {
    this.#stopAutoUnloadTimer();
    this.#autoUnloadTimer = setTimeout((): void => {
      this.#autoUnloadTimer = undefined;
      this.flush({ unload: true }).catch(reportError);
    }, QxTimeBucket.#autoUnloadTime);
  }

  #stopAutoUnloadTimer(): void {
    if (this.#autoUnloadTimer !== undefined) {
      clearTimeout(this.#autoUnloadTimer);
      this.#autoUnloadTimer = undefined;
    }
  }

  async #loadData(): Promise<void> {
    if (this.#data === undefined) {
      try {
        const bytes: Uint8Array<ArrayBuffer> = await readFile(this.#path.toString());
        this.#data = new GrowableBuffer(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      } catch (error: unknown) {
        if ((error as any).code === 'ENOENT') {
          this.#data = new GrowableBuffer();
        } else {
          throw error;
        }
      }
    }
  }

  #runDataOperation<GReturn>(
    task: (requireFlush: RequireFlush) => PromiseLike<GReturn> | GReturn,
  ): Promise<GReturn> {
    return this.#run(async (): Promise<GReturn> => {
      this.#stopAutoFlushTimer();
      this.#stopAutoUnloadTimer();

      try {
        await this.#loadData();
        return await task((): void => {
          this.#requireFlush = true;
        });
      } finally {
        this.#startAutoFlushTimer();
        this.#startAutoUnloadTimer();
      }
    });
  }

  /* READ/WRITE DATA */

  #getTime(entryByteOffset: number): number {
    return this.#data!.view.getFloat64(entryByteOffset, true);
  }

  #setTime(entryByteOffset: number, time: number): void {
    this.#data!.view.setFloat64(entryByteOffset, time, true);
  }

  #getValue(entryByteOffset: number): number {
    return this.#data!.view.getFloat64(entryByteOffset + QX_TIME_BUCKET_TIME_BYTE_LENGTH, true);
  }

  #setValue(entryByteOffset: number, value: number): void {
    this.#data!.view.setFloat64(entryByteOffset + QX_TIME_BUCKET_TIME_BYTE_LENGTH, value, true);
  }

  #getInsertionByteOffset(time: number): number {
    console.assert(this.#data !== undefined);

    if (this.#data!.length === 0) {
      return 0;
    } else {
      const lastEntryByteOffset: number = this.#data!.length - QX_TIME_BUCKET_ENTRY_BYTE_LENGTH;

      if (time >= this.#getTime(lastEntryByteOffset) /* lastTime*/) {
        // insert at the end
        return this.#data!.length;
      } else if (time <= this.#getTime(0) /* firstTime */) {
        // insert at the beginning
        return 0;
      } else {
        return (
          binarySearch(this.#data!.length >>> 4 /* (/ 16) */, (index: number): number => {
            return this.#getTime(index << 4 /* (* 16) */) - time;
          }) << 4 /* (* 16) */
        );
      }
    }
  }

  #getTimeRangeByteOffsets({ from, to /* included */ }: TimeSeriesTimeRange): TimeSeriesTimeRange {
    let fromEntryByteOffset: number = this.#getInsertionByteOffset(from);
    while (
      fromEntryByteOffset >= QX_TIME_BUCKET_ENTRY_BYTE_LENGTH &&
      from === this.#getTime(fromEntryByteOffset - QX_TIME_BUCKET_ENTRY_BYTE_LENGTH)
    ) {
      fromEntryByteOffset -= QX_TIME_BUCKET_ENTRY_BYTE_LENGTH;
    }

    let toEntryByteOffset: number = this.#getInsertionByteOffset(to);
    while (toEntryByteOffset < this.#data!.length && to === this.#getTime(toEntryByteOffset)) {
      toEntryByteOffset += QX_TIME_BUCKET_ENTRY_BYTE_LENGTH;
    }

    return {
      from: fromEntryByteOffset,
      to: toEntryByteOffset /* excluded */,
    };
  }

  #pushRaw(time: number, value: number): void {
    console.assert(this.isTimeInRange(time));
    console.assert(this.#data !== undefined);

    const insertByteOffset: number = this.#getInsertionByteOffset(time);

    this.#data!.grow(QX_TIME_BUCKET_ENTRY_BYTE_LENGTH); // [f64, f64]
    this.#data!.bytes.copyWithin(
      insertByteOffset + QX_TIME_BUCKET_ENTRY_BYTE_LENGTH,
      insertByteOffset,
      this.#data!.length,
    );
    this.#setTime(insertByteOffset, time);
    this.#setValue(insertByteOffset, value);
  }

  /* OPERATIONS */

  override push(time: number, value: number): Promise<void> {
    return this.#runDataOperation(async (requireFlush: RequireFlush): Promise<void> => {
      this.throwIfTimeOutOfRange(time);
      this.#pushRaw(time, value);
      requireFlush();
    });
  }

  override insert(entries: TimeSeriesEntry<number>[]): Promise<void> {
    return this.#runDataOperation((requireFlush: RequireFlush): void => {
      if (entries.length === 0) {
        return;
      }

      entries.sort(sortTimeSeriesEntries);

      for (let i: number = 0; i < entries.length; i += 1) {
        const { time, value } = entries[i];
        this.throwIfTimeOutOfRange(time);
        this.#pushRaw(time, value);
      }

      requireFlush();
    });
  }

  override async select(
    options?: TimeSeriesSelectOptions,
  ): Promise<readonly TimeSeriesEntry<number>[]> {
    const { asc, from, to } = normalizeTimeSeriesSelectOptions(options);

    if (from >= this.#to || to < this.#from) {
      // out-of-range
      return [];
    }

    return this.#runDataOperation((): readonly TimeSeriesEntry<number>[] => {
      const { from: fromEntryByteOffset, to: toEntryByteOffset } = this.#getTimeRangeByteOffsets({
        from,
        to,
      });

      const entries: TimeSeriesEntry<number>[] = new Array(
        (toEntryByteOffset - fromEntryByteOffset) >>> 4 /* (/16) */,
      );

      if (asc) {
        for (
          let entryIndex: number = 0, entryByteOffset: number = fromEntryByteOffset;
          entryIndex < entries.length;
          entryIndex += 1, entryByteOffset += QX_TIME_BUCKET_ENTRY_BYTE_LENGTH
        ) {
          entries[entryIndex] = {
            time: this.#getTime(entryByteOffset),
            value: this.#getValue(entryByteOffset),
          };
        }
      } else {
        for (
          let entryIndex: number = 0,
            entryByteOffset: number = toEntryByteOffset - QX_TIME_BUCKET_ENTRY_BYTE_LENGTH;
          entryIndex < entries.length;
          entryIndex += 1, entryByteOffset -= QX_TIME_BUCKET_ENTRY_BYTE_LENGTH
        ) {
          entries[entryIndex] = {
            time: this.#getTime(entryByteOffset),
            value: this.#getValue(entryByteOffset),
          };
        }
      }

      return entries;
    });
  }

  override async delete(options?: TimeSeriesDeleteOptions): Promise<void> {
    const { from, to } = normalizeTimeSeriesDeleteOptions(options);

    if (from >= this.#to || to < this.#from) {
      // out-of-range
      return;
    }

    return this.#runDataOperation((requireFlush: RequireFlush): void => {
      const { from: fromEntryByteOffset, to: toEntryByteOffset } = this.#getTimeRangeByteOffsets({
        from,
        to,
      });

      if (fromEntryByteOffset === toEntryByteOffset) {
        return;
      }

      this.#data!.bytes.copyWithin(fromEntryByteOffset, toEntryByteOffset, this.#data!.length);
      this.#data!.shrink(this.#data!.length - (toEntryByteOffset - fromEntryByteOffset));

      requireFlush();
    });
  }

  override drop(): Promise<void> {
    return this.#runDataOperation((requireFlush: RequireFlush): void => {
      if (this.#data!.length === 0) {
        return;
      }

      this.#data!.shrink(0);
      requireFlush();
    });
  }

  /* FLUSH */

  override flush({ unload = false }: QxTimeBucketFlushOptions = {}): Promise<void> {
    return this.#run(async (): Promise<void> => {
      if (this.#requireFlush) {
        console.assert(this.#data !== undefined);

        await mkdir(this.#path.dirname().toString(), {
          recursive: true,
        });

        if (this.#data!.length === 0) {
          await rm(this.#path.toString(), {
            force: true,
          });
        } else {
          await writeFile(this.#path.toString(), this.#data!.bytes.subarray(0, this.#data!.length));
        }

        this.#requireFlush = false;
      }

      if (unload) {
        this.#data = undefined;
      }
    });
  }
}
