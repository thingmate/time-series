import type { TimeSeriesDeleteOptions } from './time-series-delete-options.ts';

/**
 * Provides the ability to delete entries from a time series.
 */
export interface HavingTimeSeriesDeleteAbility {
  /**
   * Deletes a subset of time series data based on the provided options.
   *
   * @param {TimeSeriesDeleteOptions} [options] - Optional parameters that define the criteria for deletion.
   * @returns {Promise<void>} A promise that resolves when the delete operation is completed.
   */
  delete(options?: TimeSeriesDeleteOptions): Promise<void>;
}
