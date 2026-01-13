/**
 * This interface is used to define the start and end points of a time range provided to a time series operation.
 * The time is represented as a Unix timestamp in seconds.
 *
 * The `from` value specifies the starting point of the range,
 * while the `to` value specifies the endpoint (included).
 */
export interface TimeSeriesTimeRange {
  readonly from: number;
  readonly to: number;
}
