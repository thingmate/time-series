import { describe, expect, it } from 'vitest';
import type { TimeSeriesEntry } from '../time-series-entry.ts';
import { sortTimeSeriesEntries } from './sort-time-series-entries.ts';

describe('sortTimeSeriesEntries', () => {
  it('returns a negative number when the first entry comes before the second', () => {
    const entryA: TimeSeriesEntry<string> = { time: 1, value: 'a' };
    const entryB: TimeSeriesEntry<string> = { time: 2, value: 'b' };

    expect(sortTimeSeriesEntries(entryA, entryB)).toBeLessThan(0);
  });

  it('returns a positive number when the first entry comes after the second', () => {
    const entryA: TimeSeriesEntry<string> = { time: 2, value: 'a' };
    const entryB: TimeSeriesEntry<string> = { time: 1, value: 'b' };

    expect(sortTimeSeriesEntries(entryA, entryB)).toBeGreaterThan(0);
  });

  it('returns zero when both entries share the same timestamp', () => {
    const entryA: TimeSeriesEntry<string> = { time: 1, value: 'a' };
    const entryB: TimeSeriesEntry<string> = { time: 1, value: 'b' };

    expect(sortTimeSeriesEntries(entryA, entryB)).toBe(0);
  });

  it('sorts entries in ascending timestamp order', () => {
    const entries: TimeSeriesEntry<string>[] = [
      { time: 3, value: 'c' },
      { time: 1, value: 'a' },
      { time: 2, value: 'b' },
    ];

    expect([...entries].sort(sortTimeSeriesEntries)).toEqual([
      { time: 1, value: 'a' },
      { time: 2, value: 'b' },
      { time: 3, value: 'c' },
    ]);
  });
});
