/**
 * Provides the ability to push a single entry into a time series.
 *
 * @template GValue - The type of the value associated with each timestamp.
 */
export interface HavingTimeSeriesPushAbility<GValue> {
  /**
   * Adds a new entry with a specific time and value to the time series.
   *
   * @param {number} time - The timestamp (in seconds) associated with the value to be added.
   * @param {GValue} value - The value to be added, associated with the specified time.
   * @returns {Promise<void>} A promise that resolves when the entry is successfully added.
   */
  push(time: number, value: GValue): Promise<void>;
}
