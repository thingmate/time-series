import { normalizedPartialTimeSeriesTimeRange } from '../../time-range/normalized-partial-time-series-time-range.ts';
import { type TimeSeriesSelectOptions } from './time-series-select-options.ts';

export type NormalizedTimeSeriesSelectOptions = Required<TimeSeriesSelectOptions>;

export function normalizeTimeSeriesSelectOptions({
  asc = true,
  ...options
}: TimeSeriesSelectOptions | undefined = {}): NormalizedTimeSeriesSelectOptions {
  return {
    ...normalizedPartialTimeSeriesTimeRange(options),
    asc,
  };
}
