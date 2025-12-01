import { normalizedPartialTimeSeriesTimeRange } from '../../time-range/normalized-partial-time-series-time-range.ts';
import { type TimeSeriesAggregateOptions } from './time-series-aggregate-options.ts';

export type NormalizedTimeSeriesAggregateOptions = Required<TimeSeriesAggregateOptions>;

export function normalizeTimeSeriesAggregateOptions({
  replace = true,
  ...options
}: TimeSeriesAggregateOptions): NormalizedTimeSeriesAggregateOptions {
  return {
    ...normalizedPartialTimeSeriesTimeRange(options),
    replace,
  };
}
