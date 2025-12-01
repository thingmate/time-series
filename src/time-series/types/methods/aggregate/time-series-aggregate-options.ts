import { type TimeSeriesTimeRange } from '../../time-range/time-series-time-range.ts';

export interface TimeSeriesAggregateOptions extends TimeSeriesTimeRange {
  readonly replace?: boolean;
}
