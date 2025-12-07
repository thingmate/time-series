import { type PartialTimeSeriesTimeRange } from './partial-time-series-time-range.ts';
import { type TimeSeriesTimeRange } from './time-series-time-range.ts';

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
