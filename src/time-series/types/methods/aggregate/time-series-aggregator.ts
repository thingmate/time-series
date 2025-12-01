import { type PartialTimeSeriesTimeRange } from '../../time-range/partial-time-series-time-range.ts';
import { type TimeSeriesEntry } from '../../time-series-entry.ts';
import { type TimeSeriesTypeName } from '../../time-series-types-map.ts';
import { type AggregatedTimeSeriesEntry } from './aggregated-time-series-entry.ts';

export interface TimeSeriesAggregatorOptions extends Required<PartialTimeSeriesTimeRange> {}

export interface TimeSeriesAggregator<GTypeName extends TimeSeriesTypeName> {
  (
    entries: readonly TimeSeriesEntry<GTypeName>[],
    options: TimeSeriesAggregatorOptions,
  ): AggregatedTimeSeriesEntry<GTypeName>;
}
