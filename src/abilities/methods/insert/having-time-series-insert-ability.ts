import type { TimeSeriesEntry } from '../../types/time-series-entry/time-series-entry.ts';

/**
 * Provides the ability to insert entries into a time series.
 *
 * @template GValue - The type of the value associated with each timestamp.
 */
export interface HavingTimeSeriesInsertAbility<GValue> {
  /**
   * Inserts an array of time-series entries into the underlying time series database.
   *
   * The insertion must be atomic: either all the entries are inserted, or none of them are.
   *
   * @param {readonly TimeSeriesEntry<GValue>[]} entries - An array of time-series entries to be inserted. Each entry contains a timestamp (in seconds) and associated value of type GValue.
   * @returns {Promise<void>} A promise that resolves when the insertion operation is complete.
   */
  insert(entries: readonly TimeSeriesEntry<GValue>[]): Promise<void>;
}
