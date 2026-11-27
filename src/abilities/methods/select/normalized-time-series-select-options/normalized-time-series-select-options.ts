import { normalizedPartialTimeSeriesTimeRange } from '../../../types/time-range/normalized-partial-time-series-time-range/normalized-partial-time-series-time-range.ts';
import type { TimeSeriesSelectOptions } from '../time-series-select-options.ts';

/**
 * Represents time-series select options with every value explicitly defined.
 *
 * @see normalizeTimeSeriesSelectOptions
 */
export type NormalizedTimeSeriesSelectOptions = Required<TimeSeriesSelectOptions>;

/**
 * Normalizes select options by replacing missing values with their defaults.
 *
 * The time range bounds default to `Number.NEGATIVE_INFINITY` for `from` and `Number.POSITIVE_INFINITY` for `to`,
 * and entries are selected in ascending order by default.
 *
 * @param {TimeSeriesSelectOptions} [options] - The select options to normalize. Defaults to an empty set of options.
 * @returns {NormalizedTimeSeriesSelectOptions} The normalized select options.
 * @throws {Error} If the time range is invalid (see `normalizedPartialTimeSeriesTimeRange`).
 */
export function normalizeTimeSeriesSelectOptions({
  asc = true,
  ...options
}: TimeSeriesSelectOptions | undefined = {}): NormalizedTimeSeriesSelectOptions {
  return {
    ...normalizedPartialTimeSeriesTimeRange(options),
    asc,
  };
}
