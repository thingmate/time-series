import { type PartialTimeSeriesTimeRange } from '../../time-range/partial-time-series-time-range.ts';

/**
 * Represents the available options for deleting a range of data points within a time series.
 *
 * This interface extends partial time range capabilities.
 *
 * - `from` (optional, default: `Number.NEGATIVE_INFINITY`): specifies the starting point of the range.
 * - `to` (optional, default: `Number.POSITIVE_INFINITY`): specifies the endpoint (included) of the range.
 */
export interface TimeSeriesDeleteOptions extends PartialTimeSeriesTimeRange {}
