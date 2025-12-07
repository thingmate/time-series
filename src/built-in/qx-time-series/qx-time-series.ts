import { Path, type PathInput } from '@xstd/path';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { TimeSeries } from '../../time-series.ts';
import { normalizeTimeSeriesDeleteOptions } from '../../types/methods/delete/normalized-time-series-delete-options.ts';
import { type TimeSeriesDeleteOptions } from '../../types/methods/delete/time-series-delete-options.ts';
import { normalizeTimeSeriesSelectOptions } from '../../types/methods/select/normalized-time-series-select-options.ts';
import { type TimeSeriesSelectOptions } from '../../types/methods/select/time-series-select-options.ts';
import { type TimeSeriesTimeRange } from '../../types/time-range/time-series-time-range.ts';
import { sortTimeSeriesEntries } from '../../types/time-series-entry/sort-time-series-entries.ts';
import { TimeSeriesEntry } from '../../types/time-series-entry/time-series-entry.ts';
import { binarySearch } from './helpers.private/binary-search.ts';
import { handlePromiseAllSettledResult } from './helpers.private/handle-promise-all-settled-result.ts';
import { QxTimeBucket, type QxTimeBucketFlushOptions } from './qx-time-bucket.ts';

interface QxTimeSeriesConfig<GVersion extends number> {
  readonly version: GVersion;
}

interface QxTimeSeriesConfigV1 extends QxTimeSeriesConfig<1> {}

interface QxTimeSeriesOptions {
  readonly bucketsPath: Path;
  readonly buckets: QxTimeBucket[];
}

export class QxTimeSeries extends TimeSeries<number> {
  static async #loadConfig(configPath: Path): Promise<QxTimeSeriesConfigV1> {
    try {
      // TODO validate config file format/schema
      return JSON.parse(await readFile(configPath.toString(), { encoding: 'utf8' }));
    } catch (error: unknown) {
      if ((error as any).code === 'ENOENT') {
        const config: QxTimeSeriesConfigV1 = {
          version: 1,
        };
        await mkdir(configPath.dirname().toString(), { recursive: true });
        await writeFile(configPath.toString(), JSON.stringify(config), { encoding: 'utf8' });
        return config;
      } else {
        throw error;
      }
    }
  }

  static async #loadBuckets(bucketsPath: Path): Promise<QxTimeBucket[]> {
    try {
      return (await readdir(bucketsPath.toString()))
        .map((fileName: string): QxTimeBucket => {
          return QxTimeBucket.fromFilePath(bucketsPath.concat(fileName));
        })
        .sort(QxTimeBucket.sortFnc);
    } catch (error: unknown) {
      if ((error as any).code === 'ENOENT') {
        return [];
      } else {
        throw error;
      }
    }
  }

  static async open(dirPath: PathInput): Promise<QxTimeSeries> {
    dirPath = Path.of(dirPath);

    const bucketsPath: Path = dirPath.concat('buckets');

    const [config, buckets] = await Promise.all([
      this.#loadConfig(dirPath.concat('qx.config.json')),
      this.#loadBuckets(bucketsPath),
    ]);

    return new QxTimeSeries({
      ...config,
      bucketsPath,
      buckets,
    });
  }

  readonly #bucketsPath: Path;
  readonly #buckets: QxTimeBucket[]; // sorted list of buckets

  #queue: Promise<any>;

  private constructor({ bucketsPath, buckets }: QxTimeSeriesOptions) {
    super();

    this.#bucketsPath = bucketsPath;
    this.#buckets = buckets;

    this.#queue = Promise.resolve();
  }

  #run<GReturn>(task: () => PromiseLike<GReturn> | GReturn): Promise<GReturn> {
    return (this.#queue = this.#queue.then(task, task));
  }

  #getBucket(time: number): QxTimeBucket {
    const bucketIndex: number = QxTimeBucket.getIndexFromTime(time);

    const insertIndexInArray: number = binarySearch(
      this.#buckets.length,
      (indexInArray: number): number => {
        return this.#buckets[indexInArray].index - bucketIndex;
      },
    );

    if (
      insertIndexInArray < this.#buckets.length &&
      this.#buckets[insertIndexInArray].index === bucketIndex
    ) {
      return this.#buckets[insertIndexInArray];
    } else {
      const bucket: QxTimeBucket = new QxTimeBucket(this.#bucketsPath, bucketIndex);
      this.#buckets.splice(insertIndexInArray, 0, bucket);
      return bucket;
    }
  }

  #getTimeRangeBucketIndexesInArray({
    from,
    to /* included */,
  }: TimeSeriesTimeRange): TimeSeriesTimeRange {
    const fromBucketIndex: number = QxTimeBucket.getIndexFromTime(from);
    const toBucketIndex: number = QxTimeBucket.getIndexFromTime(to);

    return {
      from: binarySearch(this.#buckets.length, (indexInArray: number): number => {
        return this.#buckets[indexInArray].index - fromBucketIndex;
      }),
      to: Math.min(
        this.#buckets.length,
        binarySearch(this.#buckets.length, (indexInArray: number): number => {
          return this.#buckets[indexInArray].index - toBucketIndex;
        }) + 1,
      ) /* excluded */,
    };
  }

  /* OPERATIONS */

  override push(time: number, value: number): Promise<void> {
    return this.#run((): Promise<void> => {
      return this.#getBucket(time).push(time, value);
    });
  }

  override insert(entries: TimeSeriesEntry<number>[]): Promise<void> {
    return this.#run((): Promise<void> | void => {
      if (entries.length === 0) {
        return;
      }

      return concurrentPromises(
        entries
          .sort(sortTimeSeriesEntries)
          .map(({ time, value }: TimeSeriesEntry<number>): Promise<void> => {
            return this.#getBucket(time).push(time, value);
          }),
      );
    });
  }

  override select(options?: TimeSeriesSelectOptions): Promise<readonly TimeSeriesEntry<number>[]> {
    return this.#run(async (): Promise<readonly TimeSeriesEntry<number>[]> => {
      const { asc, from, to } = normalizeTimeSeriesSelectOptions(options);

      const { from: fromIndexInArray, to: toIndexInArray } = this.#getTimeRangeBucketIndexesInArray(
        { from, to },
      );

      const promises: Promise<readonly TimeSeriesEntry<number>[]>[] = [];

      if (asc) {
        for (let i: number = fromIndexInArray; i < toIndexInArray; i++) {
          promises.push(this.#buckets[i].select({ asc, from, to }));
        }
      } else {
        for (let i: number = toIndexInArray - 1; i >= fromIndexInArray; i--) {
          promises.push(this.#buckets[i].select({ asc, from, to }));
        }
      }

      return handlePromiseAllSettledResult(await Promise.allSettled(promises)).flat();
    });
  }

  override delete(options?: TimeSeriesDeleteOptions): Promise<void> {
    return this.#run((): Promise<void> => {
      const { from, to } = normalizeTimeSeriesDeleteOptions(options);

      const { from: fromIndexInArray, to: toIndexInArray } = this.#getTimeRangeBucketIndexesInArray(
        { from, to },
      );

      const promises: Promise<void>[] = [];

      for (let i: number = fromIndexInArray; i < toIndexInArray; i++) {
        promises.push(this.#buckets[i].delete({ from, to }));
      }

      return concurrentPromises(promises);
    });
  }

  override drop(): Promise<void> {
    return this.#run(async (): Promise<void> => {
      await concurrentPromises(
        this.#buckets.map((bucket: QxTimeBucket): Promise<void> => {
          return bucket.drop();
        }),
      );
    });
  }

  /* FLUSH */

  override flush(options?: QxTimeBucketFlushOptions): Promise<void> {
    return this.#run((): Promise<void> => {
      // TODO: remove from "buckets" the empty buckets
      return concurrentPromises(
        this.#buckets.map((bucket: QxTimeBucket): Promise<void> => {
          return bucket.flush(options);
        }),
      );
    });
  }
}

/* FUNCTIONS */

// async function concurrently<GArguments extends unknown[]>(
//   promiseFactories: Iterable<(...args: GArguments) => PromiseLike<any> | any>,
//   ...args: GArguments
// ): Promise<void> {
//   return concurrentPromises(
//     Array.from(promiseFactories, (factory: (...args: GArguments) => PromiseLike<any> | any) => {
//       return Promise.try(factory, ...args);
//     }),
//   );
// }

async function concurrentPromises(promises: Iterable<PromiseLike<any>>): Promise<void> {
  handlePromiseAllSettledResult(await Promise.allSettled(promises));
}
