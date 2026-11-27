import { describe, expect, it } from 'vitest';
import type { TimeSeriesEntry } from '../abilities/types/time-series-entry/time-series-entry.ts';
import { TimeSeries } from './time-series.ts';

class InMemoryTimeSeries extends TimeSeries<number> {
  #insertedEntries: TimeSeriesEntry<number>[] = [];
  #flushCount: number = 0;

  get insertedEntries(): readonly TimeSeriesEntry<number>[] {
    return this.#insertedEntries;
  }

  get flushCount(): number {
    return this.#flushCount;
  }

  async insert(entries: readonly TimeSeriesEntry<number>[]): Promise<void> {
    this.#insertedEntries.push(...entries);
  }

  async select(): Promise<readonly TimeSeriesEntry<number>[]> {
    return [...this.#insertedEntries];
  }

  async delete(): Promise<void> {}

  async drop(): Promise<void> {
    this.#insertedEntries = [];
  }

  async flush(): Promise<void> {
    this.#flushCount++;
  }
}

describe('TimeSeries', () => {
  describe('push', () => {
    it('inserts a single entry with the provided time and value', async () => {
      const timeSeries: InMemoryTimeSeries = new InMemoryTimeSeries();

      await timeSeries.push(1234, 42);

      expect(timeSeries.insertedEntries).toEqual([{ time: 1234, value: 42 }]);
    });
  });

  describe('dispose', () => {
    it('flushes pending operations when disposed through "Symbol.asyncDispose"', async () => {
      const timeSeries: InMemoryTimeSeries = new InMemoryTimeSeries();

      await timeSeries[Symbol.asyncDispose]();

      expect(timeSeries.flushCount).toBe(1);
    });

    it('flushes pending operations at the end of an "await using" block', async () => {
      const timeSeries: InMemoryTimeSeries = new InMemoryTimeSeries();

      {
        await using disposableTimeSeries: InMemoryTimeSeries = timeSeries;

        await disposableTimeSeries.push(1, 10);
      }

      expect(timeSeries.flushCount).toBe(1);
      expect(timeSeries.insertedEntries).toEqual([{ time: 1, value: 10 }]);
    });
  });
});
