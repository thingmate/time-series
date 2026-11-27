/**
 * Represents a single entry in a time series, containing a timestamp (in seconds) and an associated value.
 *
 * @template GValue - The type of the value associated with the timestamp.
 */
export interface TimeSeriesEntry<GValue> {
  readonly time: number;
  readonly value: GValue;
}
