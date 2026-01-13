import { type TimeSeriesDeleteOptions } from './types/methods/delete/time-series-delete-options.ts';
import { type TimeSeriesSelectOptions } from './types/methods/select/time-series-select-options.ts';
import { type TimeSeriesEntry } from './types/time-series-entry/time-series-entry.ts';

/**
 * Represents an abstract base class for managing time-series data.
 * The class provides methods to insert, select, delete, and manage time-series data entries
 * with a specified timestamp and value of a generic type.
 *
 * @template GValue The type of value associated with the time-series entries.
 * @implements {AsyncDisposable}
 */
export abstract class TimeSeries<GValue> implements AsyncDisposable {
  /**
   * Adds a new entry with a specific time and value to the time series.
   *
   * @param {number} time - The timestamp (in seconds) associated with the value to be added.
   * @param {GValue} value - The value to be added, associated with the specified time.
   * @returns {Promise<void>} A promise that resolves when the entry is successfully added.
   */
  push(time: number, value: GValue): Promise<void> {
    return this.insert([{ time, value }]);
  }

  /**
   * Inserts an array of time-series entries into the underlying time series database.
   *
   * @param {readonly TimeSeriesEntry<GValue>[]} entries - An array of time-series entries to be inserted. Each entry contains a timestamp (in seconds) and associated value of type GValue.
   * @returns {Promise<void>} A promise that resolves when the insertion operation is complete.
   */
  abstract insert(entries: readonly TimeSeriesEntry<GValue>[]): Promise<void>;

  /**
   * Selects a subset of time series data based on the provided options.
   *
   * @param {TimeSeriesSelectOptions} [options] - Configuration options to filter and customize the selection of time series data.
   * @returns {Promise<readonly TimeSeriesEntry<GValue>[]>} A promise that resolves to an array of time series entries matching the specified criteria.
   */
  abstract select(options?: TimeSeriesSelectOptions): Promise<readonly TimeSeriesEntry<GValue>[]>;

  /**
   * Deletes a subset of time series data based on the provided options.
   *
   * @param {TimeSeriesDeleteOptions} [options] - Optional parameters that define the criteria for deletion.
   * @returns {Promise<void>} A promise that resolves when the delete operation is completed.
   */
  abstract delete(options?: TimeSeriesDeleteOptions): Promise<void>;

  /**
   * Drops all the data from the time series database.
   *
   * @returns {Promise<void>} A promise that resolves when the drop operation is completed.
   */
  abstract drop(): Promise<void>;

  /**
   * Flushes all pending operations.
   *
   * @returns {Promise<void>} A promise that resolves when all pending operations are completed.
   */
  abstract flush(): Promise<void>;

  /**
   * Implementation of the `AsyncDisposable` interface, that flushes all pending operations when the time series is disposed.
   *
   * @returns {Promise<void>} A promise that resolves once the cleanup process is completed.
   */
  [Symbol.asyncDispose](): Promise<void> {
    return this.flush();
  }
}
