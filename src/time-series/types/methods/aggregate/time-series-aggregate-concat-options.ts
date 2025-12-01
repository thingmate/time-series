import { type TimeSeriesAggregateOptions } from './time-series-aggregate-options.ts';

export interface TimeSeriesAggregateConcatOptions extends TimeSeriesAggregateOptions {
  readonly separator?: string;
}
