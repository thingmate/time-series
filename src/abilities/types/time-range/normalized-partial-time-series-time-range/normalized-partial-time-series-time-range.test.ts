import { describe, expect, it } from 'vitest';
import { normalizedPartialTimeSeriesTimeRange } from './normalized-partial-time-series-time-range.ts';

describe('normalizedPartialTimeSeriesTimeRange', () => {
  it('returns an unbounded range when the range is undefined', () => {
    expect(normalizedPartialTimeSeriesTimeRange(undefined)).toEqual({
      from: Number.NEGATIVE_INFINITY,
      to: Number.POSITIVE_INFINITY,
    });
  });

  it('returns an unbounded range when the range is empty', () => {
    expect(normalizedPartialTimeSeriesTimeRange({})).toEqual({
      from: Number.NEGATIVE_INFINITY,
      to: Number.POSITIVE_INFINITY,
    });
  });

  it('keeps the provided "from" bound and defaults "to" to positive infinity', () => {
    expect(normalizedPartialTimeSeriesTimeRange({ from: 10 })).toEqual({
      from: 10,
      to: Number.POSITIVE_INFINITY,
    });
  });

  it('keeps the provided "to" bound and defaults "from" to negative infinity', () => {
    expect(normalizedPartialTimeSeriesTimeRange({ to: 20 })).toEqual({
      from: Number.NEGATIVE_INFINITY,
      to: 20,
    });
  });

  it('keeps both provided bounds', () => {
    expect(normalizedPartialTimeSeriesTimeRange({ from: 10, to: 20 })).toEqual({
      from: 10,
      to: 20,
    });
  });

  it('accepts a "to" bound equal to "from"', () => {
    expect(normalizedPartialTimeSeriesTimeRange({ from: 10, to: 10 })).toEqual({
      from: 10,
      to: 10,
    });
  });

  it('accepts infinite bounds', () => {
    expect(
      normalizedPartialTimeSeriesTimeRange({
        from: Number.NEGATIVE_INFINITY,
        to: Number.POSITIVE_INFINITY,
      }),
    ).toEqual({ from: Number.NEGATIVE_INFINITY, to: Number.POSITIVE_INFINITY });
  });

  it('throws when "from" is NaN', () => {
    expect(() => normalizedPartialTimeSeriesTimeRange({ from: Number.NaN })).toThrowError(
      '"from" must be a number in range [-Infinity, +Infinity[.',
    );
  });

  it('throws when "from" is not a number', () => {
    expect(() =>
      normalizedPartialTimeSeriesTimeRange({ from: '10' as unknown as number }),
    ).toThrowError('"from" must be a number in range [-Infinity, +Infinity[.');
  });

  it('throws when "to" is NaN', () => {
    expect(() => normalizedPartialTimeSeriesTimeRange({ to: Number.NaN })).toThrowError(
      '"to" must be a number in range [from, +Infinity].',
    );
  });

  it('throws when "to" is not a number', () => {
    expect(() =>
      normalizedPartialTimeSeriesTimeRange({ to: '20' as unknown as number }),
    ).toThrowError('"to" must be a number in range [from, +Infinity].');
  });

  it('throws when "to" is lower than "from"', () => {
    expect(() => normalizedPartialTimeSeriesTimeRange({ from: 20, to: 10 })).toThrowError(
      '"to" must be a number in range [from, +Infinity].',
    );
  });
});
