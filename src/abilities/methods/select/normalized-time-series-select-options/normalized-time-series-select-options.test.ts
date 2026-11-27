import { describe, expect, it } from 'vitest';
import { normalizeTimeSeriesSelectOptions } from './normalized-time-series-select-options.ts';

describe('normalizeTimeSeriesSelectOptions', () => {
  it('returns unbounded ascending defaults when the options are undefined', () => {
    expect(normalizeTimeSeriesSelectOptions(undefined)).toEqual({
      from: Number.NEGATIVE_INFINITY,
      to: Number.POSITIVE_INFINITY,
      asc: true,
    });
  });

  it('returns unbounded ascending defaults when the options are empty', () => {
    expect(normalizeTimeSeriesSelectOptions({})).toEqual({
      from: Number.NEGATIVE_INFINITY,
      to: Number.POSITIVE_INFINITY,
      asc: true,
    });
  });

  it('keeps provided options and fills the missing ones', () => {
    expect(normalizeTimeSeriesSelectOptions({ asc: false })).toEqual({
      from: Number.NEGATIVE_INFINITY,
      to: Number.POSITIVE_INFINITY,
      asc: false,
    });

    expect(normalizeTimeSeriesSelectOptions({ from: 10 })).toEqual({
      from: 10,
      to: Number.POSITIVE_INFINITY,
      asc: true,
    });

    expect(normalizeTimeSeriesSelectOptions({ to: 20 })).toEqual({
      from: Number.NEGATIVE_INFINITY,
      to: 20,
      asc: true,
    });
  });

  it('throws when the time range is invalid', () => {
    expect(() => normalizeTimeSeriesSelectOptions({ from: 20, to: 10 })).toThrowError(
      '"to" must be a number in range [from, +Infinity].',
    );
  });
});
