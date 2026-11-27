import type { TimeSeriesTimeRange } from './time-series-time-range.ts';

/**
 * Represents a time range whose bounds are optional.
 *
 * Missing bounds are meant to be replaced by unbounded defaults
 * (`Number.NEGATIVE_INFINITY` for `from` and `Number.POSITIVE_INFINITY` for `to`),
 * for example with `normalizedPartialTimeSeriesTimeRange`.
 */
export type PartialTimeSeriesTimeRange = Partial<TimeSeriesTimeRange>;
