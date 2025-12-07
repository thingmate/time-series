import { type TimeSeriesDeleteOptions } from './types/methods/delete/time-series-delete-options.ts';
import { type TimeSeriesSelectOptions } from './types/methods/select/time-series-select-options.ts';
import { type TimeSeriesEntry } from './types/time-series-entry/time-series-entry.ts';

export abstract class TimeSeries<GValue> implements AsyncDisposable {
  push(time: number, value: GValue): Promise<void> {
    return this.insert([{ time, value }]);
  }

  abstract insert(entries: readonly TimeSeriesEntry<GValue>[]): Promise<void>;

  abstract select(options?: TimeSeriesSelectOptions): Promise<readonly TimeSeriesEntry<GValue>[]>;

  abstract delete(options?: TimeSeriesDeleteOptions): Promise<void>;

  abstract drop(): Promise<void>;

  abstract flush(): Promise<void>;

  [Symbol.asyncDispose](): Promise<void> {
    return this.flush();
  }
}
