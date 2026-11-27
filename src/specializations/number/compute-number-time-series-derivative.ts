import type { TimeSeriesEntry } from '../../abilities/types/time-series-entry/time-series-entry.ts';

/**
 * Represents the available options for computing the derivative of a numeric time series.
 *
 * - `time` (optional, default: `'start'`): specifies which timestamp is assigned to each derivative entry:
 *   the timestamp of the first of the two entries used (`'start'`), of the second (`'end'`),
 *   or the midpoint between both (`'mean'`).
 */
export interface ComputeNumberTimeSeriesDerivativeOptions {
  readonly time?: 'start' | 'end' | 'mean';
}

/**
 * Computes the derivative of a numeric time series.
 *
 * Each derivative entry is computed from two consecutive entries: its value is the difference of values
 * divided by the difference of timestamps (in value units per second). The output contains one entry less
 * than the input.
 *
 * The entries are expected to be sorted by ascending timestamp, and consecutive entries sharing the same
 * timestamp produce `Infinity` or `NaN` values.
 *
 * @param {readonly TimeSeriesEntry<number>[]} entries - The numeric time-series entries to compute the derivative from, sorted by ascending timestamp.
 * @param {ComputeNumberTimeSeriesDerivativeOptions} [options] - Options controlling the timestamp of the derivative entries.
 * @returns {readonly TimeSeriesEntry<number>[]} The derivative entries.
 */
export function computeNumberTimeSeriesDerivative(
  entries: readonly TimeSeriesEntry<number>[],
  { time = 'start' }: ComputeNumberTimeSeriesDerivativeOptions = {},
): readonly TimeSeriesEntry<number>[] {
  const output: TimeSeriesEntry<number>[] = new Array(Math.max(entries.length - 1, 0));

  for (let i: number = 0, l: number = entries.length - 1; i < l; i++) {
    const entryA: TimeSeriesEntry<number> = entries[i];
    const entryB: TimeSeriesEntry<number> = entries[i + 1];

    output[i] = {
      time:
        time === 'start'
          ? entryA.time
          : time === 'end'
            ? entryB.time
            : (entryA.time + entryB.time) / 2,
      value: (entryB.value - entryA.value) / (entryB.time - entryA.time),
    };
  }

  return output;
}
