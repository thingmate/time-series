import { normalizedPartialTimeSeriesTimeRange } from '../../../types/time-range/normalized-partial-time-series-time-range/normalized-partial-time-series-time-range.ts';
import type { TimeSeriesDeleteOptions } from '../time-series-delete-options.ts';

/**
 * Represents time-series delete options with every value explicitly defined.
 *
 * @see normalizeTimeSeriesDeleteOptions
 */
export type NormalizedTimeSeriesDeleteOptions = Required<TimeSeriesDeleteOptions>;

/**
 * Normalizes delete options by replacing missing time range bounds with their defaults.
 *
 * The bounds default to `Number.NEGATIVE_INFINITY` for `from` and `Number.POSITIVE_INFINITY` for `to`,
 * so that deleting without options removes every entry.
 *
 * @param {TimeSeriesDeleteOptions} [options] - The delete options to normalize.
 * @returns {NormalizedTimeSeriesDeleteOptions} The normalized delete options.
 * @throws {Error} If the time range is invalid (see `normalizedPartialTimeSeriesTimeRange`).
 */
export function normalizeTimeSeriesDeleteOptions(
  options: TimeSeriesDeleteOptions | undefined,
): NormalizedTimeSeriesDeleteOptions {
  return normalizedPartialTimeSeriesTimeRange(options);
}
