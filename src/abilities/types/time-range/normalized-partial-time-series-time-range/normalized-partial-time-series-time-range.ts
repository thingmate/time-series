import type { PartialTimeSeriesTimeRange } from '../partial-time-series-time-range.ts';
import type { TimeSeriesTimeRange } from '../time-series-time-range.ts';

/**
 * Normalizes a partial time range into a complete time range.
 *
 * Missing bounds default to `Number.NEGATIVE_INFINITY` for `from` and `Number.POSITIVE_INFINITY` for `to`,
 * so that a normalized range covers every entry by default.
 *
 * @param {PartialTimeSeriesTimeRange} [range] - The partial time range to normalize. Defaults to an empty range.
 * @returns {TimeSeriesTimeRange} A time range with both bounds defined.
 * @throws {Error} If `from` is not a number or is `NaN`.
 * @throws {Error} If `to` is not a number, is `NaN`, or is lower than `from`.
 */
export function normalizedPartialTimeSeriesTimeRange({
  from = Number.NEGATIVE_INFINITY,
  to = Number.POSITIVE_INFINITY,
}: PartialTimeSeriesTimeRange | undefined = {}): TimeSeriesTimeRange {
  if (typeof from !== 'number' || Number.isNaN(from)) {
    throw new Error('"from" must be a number in range [-Infinity, +Infinity[.');
  }

  if (typeof to !== 'number' || Number.isNaN(to) || to < from) {
    throw new Error('"to" must be a number in range [from, +Infinity].');
  }

  return {
    from,
    to,
  };
}
