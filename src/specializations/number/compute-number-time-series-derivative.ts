import type { TimeSeriesEntry } from '../../types/time-series-entry/time-series-entry.ts';

export interface ComputeNumberTimeSeriesDerivativeOptions {
  readonly time?: 'start' | 'end' | 'mean';
}

export function computeNumberTimeSeriesDerivative(
  entries: readonly TimeSeriesEntry<number>[],
  { time = 'start' }: ComputeNumberTimeSeriesDerivativeOptions = {},
): readonly TimeSeriesEntry<number>[] {
  const output: TimeSeriesEntry<number>[] = new Array(entries.length - 1);

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
