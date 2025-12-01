import { type InferTimeSeriesType, type TimeSeriesTypeName } from '../../time-series-types-map.ts';

export interface AggregatedTimeSeriesEntry<GTypeName extends TimeSeriesTypeName> {
  readonly from: number;
  readonly to: number;
  readonly value: InferTimeSeriesType<GTypeName>;
}
