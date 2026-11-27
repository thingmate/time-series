/**
 * Provides the ability to flush all the pending operations of a time series.
 */
export interface HavingTimeSeriesFlushAbility {
  /**
   * Flushes all pending operations.
   *
   * @returns {Promise<void>} A promise that resolves when all pending operations are completed.
   */
  flush(): Promise<void>;
}
