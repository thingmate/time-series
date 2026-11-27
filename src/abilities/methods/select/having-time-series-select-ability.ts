import type { TimeSeriesEntry } from '../../types/time-series-entry/time-series-entry.ts';
import type { TimeSeriesSelectOptions } from './time-series-select-options.ts';

/**
 * Provides the ability to select entries from a time series.
 *
 * @template GValue - The type of the value associated with each timestamp.
 */
export interface HavingTimeSeriesSelectAbility<GValue> {
  /**
   * Selects a subset of time series data based on the provided options.
   *
   * @param {TimeSeriesSelectOptions} [options] - Configuration options to filter and customize the selection of time series data.
   * @returns {Promise<readonly TimeSeriesEntry<GValue>[]>} A promise that resolves to an array of time series entries matching the specified criteria.
   */
  select(options?: TimeSeriesSelectOptions): Promise<readonly TimeSeriesEntry<GValue>[]>;
}
