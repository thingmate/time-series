import { describe, expect, it } from 'vitest';
import { normalizeTimeSeriesDeleteOptions } from './normalized-time-series-delete-options.ts';

describe('normalizeTimeSeriesDeleteOptions', () => {
  it('returns unbounded defaults when the options are undefined', () => {
    expect(normalizeTimeSeriesDeleteOptions(undefined)).toEqual({
      from: Number.NEGATIVE_INFINITY,
      to: Number.POSITIVE_INFINITY,
    });
  });

  it('returns unbounded defaults when the options are empty', () => {
    expect(normalizeTimeSeriesDeleteOptions({})).toEqual({
      from: Number.NEGATIVE_INFINITY,
      to: Number.POSITIVE_INFINITY,
    });
  });

  it('keeps provided bounds and fills the missing ones', () => {
    expect(normalizeTimeSeriesDeleteOptions({ from: 10 })).toEqual({
      from: 10,
      to: Number.POSITIVE_INFINITY,
    });

    expect(normalizeTimeSeriesDeleteOptions({ to: 20 })).toEqual({
      from: Number.NEGATIVE_INFINITY,
      to: 20,
    });

    expect(normalizeTimeSeriesDeleteOptions({ from: 10, to: 20 })).toEqual({ from: 10, to: 20 });
  });

  it('throws when the time range is invalid', () => {
    expect(() => normalizeTimeSeriesDeleteOptions({ from: 20, to: 10 })).toThrowError(
      '"to" must be a number in range [from, +Infinity].',
    );
  });
});
