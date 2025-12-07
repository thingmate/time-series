import { type TimeSeriesEntry } from './time-series-entry.ts';

export function sortTimeSeriesEntries(a: TimeSeriesEntry<any>, b: TimeSeriesEntry<any>): number {
  return a.time - b.time;
}
