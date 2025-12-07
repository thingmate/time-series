import { normalizedPartialTimeSeriesTimeRange } from '../../time-range/normalized-partial-time-series-time-range.ts';
import { type TimeSeriesDeleteOptions } from './time-series-delete-options.ts';

export type NormalizedTimeSeriesDeleteOptions = Required<TimeSeriesDeleteOptions>;

export function normalizeTimeSeriesDeleteOptions(
  options: TimeSeriesDeleteOptions | undefined,
): NormalizedTimeSeriesDeleteOptions {
  return normalizedPartialTimeSeriesTimeRange(options);
}
