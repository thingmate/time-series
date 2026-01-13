import { type PartialTimeSeriesTimeRange } from '../../time-range/partial-time-series-time-range.ts';

/**
 * Represents the available options for selecting a time series.
 *
 * This interface extends partial time range capabilities
 * with additional configuration options for ordering.
 *
 * - `from` (optional, default: `Number.NEGATIVE_INFINITY`): specifies the starting point of the range.
 * - `to` (optional, default: `Number.POSITIVE_INFINITY`): specifies the endpoint (included) of the range.
 * - `asc` (optional, default: `true`): specifies whether the results should be ordered ascending.
 */
export interface TimeSeriesSelectOptions extends PartialTimeSeriesTimeRange {
  readonly asc?: boolean;
}
