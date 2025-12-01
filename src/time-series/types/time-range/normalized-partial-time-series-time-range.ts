import { type PartialTimeSeriesTimeRange } from './partial-time-series-time-range.ts';
import { type TimeSeriesTimeRange } from './time-series-time-range.ts';

export function normalizedPartialTimeSeriesTimeRange({
  from = Number.NEGATIVE_INFINITY,
  to = Number.POSITIVE_INFINITY,
}: PartialTimeSeriesTimeRange | undefined = {}): TimeSeriesTimeRange {
  if (
    typeof from !== 'number' ||
    (from !== Number.NEGATIVE_INFINITY && !Number.isSafeInteger(from))
  ) {
    throw new Error('"from" must be an integer in range [-Infinity, +Infinity[.');
  }

  if (
    typeof to !== 'number' ||
    (to !== Number.POSITIVE_INFINITY && !Number.isSafeInteger(to)) ||
    to < from
  ) {
    throw new Error('"to" must be an integer in range [from, +Infinity].');
  }

  return {
    from,
    to,
  };
}
