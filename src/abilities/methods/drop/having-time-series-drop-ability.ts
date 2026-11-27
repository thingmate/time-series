/**
 * Provides the ability to drop all the data of a time series.
 */
export interface HavingTimeSeriesDropAbility {
  /**
   * Drops all the data from the time series database.
   *
   * @returns {Promise<void>} A promise that resolves when the drop operation is completed.
   */
  drop(): Promise<void>;
}
