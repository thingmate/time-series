import { type PartialTimeSeriesTimeRange } from '../../time-range/partial-time-series-time-range.ts';

export interface TimeSeriesSelectOptions extends PartialTimeSeriesTimeRange {
  readonly asc?: boolean;
}
