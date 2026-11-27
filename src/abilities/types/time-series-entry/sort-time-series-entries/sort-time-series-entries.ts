import type { TimeSeriesEntry } from '../time-series-entry.ts';

/**
 * Compares two time-series entries by timestamp, in ascending order.
 *
 * Intended to be used as a comparator for `Array.prototype.sort`.
 *
 * @param {TimeSeriesEntry<any>} a - The first entry to compare.
 * @param {TimeSeriesEntry<any>} b - The second entry to compare.
 * @returns {number} A negative number if `a` comes before `b`, a positive number if `a` comes after `b`, and zero if both entries share the same timestamp.
 */
export function sortTimeSeriesEntries(a: TimeSeriesEntry<any>, b: TimeSeriesEntry<any>): number {
  return a.time - b.time;
}
