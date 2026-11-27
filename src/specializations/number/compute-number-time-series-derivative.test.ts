import { describe, expect, it } from 'vitest';
import type { TimeSeriesEntry } from '../../abilities/types/time-series-entry/time-series-entry.ts';
import { computeNumberTimeSeriesDerivative } from './compute-number-time-series-derivative.ts';

describe('computeNumberTimeSeriesDerivative', () => {
  const entries: readonly TimeSeriesEntry<number>[] = [
    { time: 0, value: 0 },
    { time: 1, value: 10 },
    { time: 3, value: 20 },
  ];

  it('computes the derivative from consecutive entries, timestamped with the start entry by default', () => {
    expect(computeNumberTimeSeriesDerivative(entries)).toEqual([
      { time: 0, value: 10 },
      { time: 1, value: 5 },
    ]);
  });

  it('timestamps derivative entries with the end entry when "time" is "end"', () => {
    expect(computeNumberTimeSeriesDerivative(entries, { time: 'end' })).toEqual([
      { time: 1, value: 10 },
      { time: 3, value: 5 },
    ]);
  });

  it('timestamps derivative entries with the midpoint when "time" is "mean"', () => {
    expect(computeNumberTimeSeriesDerivative(entries, { time: 'mean' })).toEqual([
      { time: 0.5, value: 10 },
      { time: 2, value: 5 },
    ]);
  });

  it('returns an empty array when the time series is empty', () => {
    expect(computeNumberTimeSeriesDerivative([])).toEqual([]);
  });

  it('returns an empty array when the time series has a single entry', () => {
    expect(computeNumberTimeSeriesDerivative([{ time: 1, value: 5 }])).toEqual([]);
  });

  it('computes negative derivatives for decreasing values', () => {
    expect(
      computeNumberTimeSeriesDerivative([
        { time: 0, value: 10 },
        { time: 2, value: 0 },
      ]),
    ).toEqual([{ time: 0, value: -5 }]);
  });

  it('produces an infinite derivative when consecutive entries share the same timestamp', () => {
    expect(
      computeNumberTimeSeriesDerivative([
        { time: 5, value: 1 },
        { time: 5, value: 2 },
      ]),
    ).toEqual([{ time: 5, value: Number.POSITIVE_INFINITY }]);
  });
});
