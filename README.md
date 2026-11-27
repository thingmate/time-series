[![npm (scoped)](https://img.shields.io/npm/v/@thingmate/time-series.svg)](https://www.npmjs.com/package/@thingmate/time-series)
![npm](https://img.shields.io/npm/dm/@thingmate/time-series.svg)
![NPM](https://img.shields.io/npm/l/@thingmate/time-series.svg)
![npm type definitions](https://img.shields.io/npm/types/@thingmate/time-series.svg)
![coverage](https://img.shields.io/badge/coverage-100%25-green)

<picture>
  <source height="64" media="(prefers-color-scheme: dark)" srcset="https://github.com/thingmate/website/blob/main/assets/logo/png/logo-large-dark.png?raw=true">
  <source height="64" media="(prefers-color-scheme: light)" srcset="https://github.com/thingmate/website/blob/main/assets/logo/png/logo-large-light.png?raw=true">
  <img height="64" alt="Shows a black logo in light color mode and a white one in dark color mode." src="https://github.com/thingmate/website/blob/main/assets/logo/png/logo-large-light.png?raw=true">
</picture>

## @thingmate/time-series

Abstract data structures and classes for time series data.

## 📦 Installation

```shell
yarn add @thingmate/time-series
# or
npm install @thingmate/time-series --save
```

## 📜 Documentation

This library provides the abstract `TimeSeries` class, a set of composable `Having*` ability
interfaces, and helpers to store and query time series data: values associated with Unix timestamps
(in seconds).

It ships without any storage implementation: extend `TimeSeries` to plug the backend of your choice,
or use a ready-made implementation like
[`@thingmate/zekta-time-series`](https://www.npmjs.com/package/@thingmate/zekta-time-series).

### TimeSeries

```ts
declare abstract class TimeSeries<GValue> implements AsyncDisposable {
  /**
   * Adds a new entry with a specific time and value to the time series.
   *
   * @param {number} time - The timestamp (in seconds) associated with the value to be added.
   * @param {GValue} value - The value to be added, associated with the specified time.
   * @returns {Promise<void>} A promise that resolves when the entry is successfully added.
   */
  push(time: number, value: GValue): Promise<void>;

  /**
   * Inserts an array of time-series entries into the underlying time series database.
   *
   * The insertion must be atomic: either all the entries are inserted, or none of them are.
   *
   * @param {readonly TimeSeriesEntry<GValue>[]} entries - An array of time-series entries to be inserted. Each entry contains a timestamp (in seconds) and associated value of type GValue.
   * @returns {Promise<void>} A promise that resolves when the insertion operation is complete.
   */
  abstract insert(entries: readonly TimeSeriesEntry<GValue>[]): Promise<void>;

  /**
   * Selects a subset of time series data based on the provided options.
   *
   * @param {TimeSeriesSelectOptions} [options] - Configuration options to filter and customize the selection of time series data.
   * @returns {Promise<readonly TimeSeriesEntry<GValue>[]>} A promise that resolves to an array of time series entries matching the specified criteria.
   */
  abstract select(options?: TimeSeriesSelectOptions): Promise<readonly TimeSeriesEntry<GValue>[]>;

  /**
   * Deletes a subset of time series data based on the provided options.
   *
   * @param {TimeSeriesDeleteOptions} [options] - Optional parameters that define the criteria for deletion.
   * @returns {Promise<void>} A promise that resolves when the delete operation is completed.
   */
  abstract delete(options?: TimeSeriesDeleteOptions): Promise<void>;

  /**
   * Drops all the data from the time series database.
   *
   * @returns {Promise<void>} A promise that resolves when the drop operation is completed.
   */
  abstract drop(): Promise<void>;

  /**
   * Flushes all pending operations.
   *
   * @returns {Promise<void>} A promise that resolves when all pending operations are completed.
   */
  abstract flush(): Promise<void>;

  /**
   * Implementation of the `AsyncDisposable` interface, that flushes all pending operations when the time series is disposed.
   *
   * @returns {Promise<void>} A promise that resolves once the cleanup process is completed.
   */
  [Symbol.asyncDispose](): Promise<void>;
}
```

`TimeSeries` is abstract: implement `insert`, `select`, `delete`, `drop` and `flush` to connect it to
a real storage. `push` is already implemented on top of `insert`, and disposing the time series (with
`await using` or `Symbol.asyncDispose`) flushes the pending operations.

**Example:** an in-memory time series

```ts
import {
  normalizeTimeSeriesDeleteOptions,
  normalizeTimeSeriesSelectOptions,
  sortTimeSeriesEntries,
  TimeSeries,
} from '@thingmate/time-series';
import type {
  TimeSeriesDeleteOptions,
  TimeSeriesEntry,
  TimeSeriesSelectOptions,
} from '@thingmate/time-series';

class InMemoryTimeSeries<GValue> extends TimeSeries<GValue> {
  readonly #entries: TimeSeriesEntry<GValue>[] = [];

  async insert(entries: readonly TimeSeriesEntry<GValue>[]): Promise<void> {
    this.#entries.push(...entries); // atomic: either every entry is inserted, or none are
  }

  async select(options?: TimeSeriesSelectOptions): Promise<readonly TimeSeriesEntry<GValue>[]> {
    const { from, to, asc } = normalizeTimeSeriesSelectOptions(options);
    const entries: TimeSeriesEntry<GValue>[] = this.#entries
      .filter(({ time }): boolean => time >= from && time <= to)
      .sort(sortTimeSeriesEntries);
    return asc ? entries : entries.reverse();
  }

  async delete(options?: TimeSeriesDeleteOptions): Promise<void> {
    const { from, to } = normalizeTimeSeriesDeleteOptions(options);
    const remaining: TimeSeriesEntry<GValue>[] = this.#entries.filter(
      ({ time }): boolean => time < from || time > to,
    );
    this.#entries.length = 0;
    this.#entries.push(...remaining);
  }

  async drop(): Promise<void> {
    this.#entries.length = 0;
  }

  async flush(): Promise<void> {} // this storage is synchronous: nothing is pending
}
```

**Example:** write and read entries

```ts
const timeSeries: InMemoryTimeSeries<number> = new InMemoryTimeSeries();

await timeSeries.push(1700000000, 21.5); // 2023-11-14T22:13:20Z
await timeSeries.push(1700000060, 22);

await timeSeries.select(); // [{ time: 1700000000, value: 21.5 }, { time: 1700000060, value: 22 }]
await timeSeries.select({ from: 1700000000, asc: false }); // newest entries first
await timeSeries.select({ from: 1700000000, to: 1700000000 }); // both bounds are included

await timeSeries.delete({ from: 1700000000, to: 1700000060 });
await timeSeries.drop();
```

**Example:** flush pending operations on disposal

```ts
{
  await using timeSeries: InMemoryTimeSeries<number> = new InMemoryTimeSeries();

  await timeSeries.push(1700000000, 21.5);
  // `flush` is called when leaving this scope
}
```

### Abilities

Each capability is also exposed as a single-method `Having*` interface, all exported from the
package root, so implementations can be typed on the exact subset they support. `TimeSeries`
implements them all through the aggregate `HavingTimeSeriesAbilities<GValue>` interface, which
extends `AsyncDisposable`.

| Ability                                 | Method              |
| --------------------------------------- | ------------------- |
| `HavingTimeSeriesPushAbility<GValue>`   | `push(time, value)` |
| `HavingTimeSeriesInsertAbility<GValue>` | `insert(entries)`   |
| `HavingTimeSeriesSelectAbility<GValue>` | `select(options?)`  |
| `HavingTimeSeriesDeleteAbility`         | `delete(options?)`  |
| `HavingTimeSeriesDropAbility`           | `drop()`            |
| `HavingTimeSeriesFlushAbility`          | `flush()`           |

### Entries and time ranges

```ts
/**
 * Represents a single entry in a time series, containing a timestamp (in seconds) and an associated value.
 */
interface TimeSeriesEntry<GValue> {
  readonly time: number;
  readonly value: GValue;
}

/**
 * This interface is used to define the start and end points of a time range provided to a time series operation.
 * The time is represented as a Unix timestamp in seconds.
 *
 * The `from` value specifies the starting point of the range,
 * while the `to` value specifies the endpoint (included).
 */
interface TimeSeriesTimeRange {
  readonly from: number;
  readonly to: number;
}
```

Times are Unix timestamps **in seconds**. Select and delete operations accept a partial time range:
missing bounds are replaced by `Number.NEGATIVE_INFINITY` and `Number.POSITIVE_INFINITY`, so an empty
range selects or deletes every entry.

### Select and delete options

| Option | Default                    | Description                           |
| ------ | -------------------------- | ------------------------------------- |
| `from` | `Number.NEGATIVE_INFINITY` | Starting point of the range.          |
| `to`   | `Number.POSITIVE_INFINITY` | Endpoint of the range (**included**). |
| `asc`  | `true`                     | Order of the results (`select` only). |

```ts
/**
 * Represents the available options for selecting a time series.
 *
 * This interface extends partial time range capabilities
 * with additional configuration options for ordering.
 *
 * - `from` (optional, default: `Number.NEGATIVE_INFINITY`): specifies the starting point of the range.
 * - `to` (optional, default: `Number.POSITIVE_INFINITY`): specifies the endpoint (included) of the range.
 * - `asc` (optional, default: `true`): specifies whether the results should be ordered ascending.
 */
interface TimeSeriesSelectOptions extends Partial<TimeSeriesTimeRange> {
  readonly asc?: boolean;
}

/**
 * Represents the available options for deleting a range of data points within a time series.
 *
 * This type extends partial time range capabilities.
 *
 * - `from` (optional, default: `Number.NEGATIVE_INFINITY`): specifies the starting point of the range.
 * - `to` (optional, default: `Number.POSITIVE_INFINITY`): specifies the endpoint (included) of the range.
 */
type TimeSeriesDeleteOptions = PartialTimeSeriesTimeRange;
```

### Derivative

`computeNumberTimeSeriesDerivative` computes the derivative of a numeric time series: each output
entry is computed from two consecutive entries, with the difference of values divided by the
difference of timestamps. The output contains one entry less than the input.

```ts
/**
 * Represents the available options for computing the derivative of a numeric time series.
 *
 * - `time` (optional, default: `'start'`): specifies which timestamp is assigned to each derivative entry:
 *   the timestamp of the first of the two entries used (`'start'`), of the second (`'end'`),
 *   or the midpoint between both (`'mean'`).
 */
interface ComputeNumberTimeSeriesDerivativeOptions {
  readonly time?: 'start' | 'end' | 'mean';
}

declare function computeNumberTimeSeriesDerivative(
  entries: readonly TimeSeriesEntry<number>[],
  options?: ComputeNumberTimeSeriesDerivativeOptions,
): readonly TimeSeriesEntry<number>[];
```

**Example:**

```ts
import { computeNumberTimeSeriesDerivative } from '@thingmate/time-series';

const temperatures: readonly TimeSeriesEntry<number>[] = [
  { time: 1700000000, value: 21.5 },
  { time: 1700000060, value: 22 },
  { time: 1700000120, value: 22.5 },
];

computeNumberTimeSeriesDerivative(temperatures);
// [{ time: 1700000000, value: 0.008333333333333333 }, { time: 1700000060, value: 0.008333333333333333 }]
// ^ (22 - 21.5) / 60

computeNumberTimeSeriesDerivative(temperatures, { time: 'mean' }); // timestamps at the midpoints
```

### Helpers

#### sortTimeSeriesEntries

```ts
declare function sortTimeSeriesEntries(a: TimeSeriesEntry<any>, b: TimeSeriesEntry<any>): number;
```

Compares two entries by timestamp, in ascending order. Intended to be used as a comparator for
`Array.prototype.sort`.

#### Normalization helpers

```ts
declare function normalizedPartialTimeSeriesTimeRange(
  range?: PartialTimeSeriesTimeRange,
): TimeSeriesTimeRange;

declare function normalizeTimeSeriesSelectOptions(
  options?: TimeSeriesSelectOptions,
): NormalizedTimeSeriesSelectOptions;

declare function normalizeTimeSeriesDeleteOptions(
  options: TimeSeriesDeleteOptions | undefined,
): NormalizedTimeSeriesDeleteOptions;
```

`normalizedPartialTimeSeriesTimeRange` fills the missing range bounds with their unbounded defaults.
`normalizeTimeSeriesSelectOptions` and `normalizeTimeSeriesDeleteOptions` build on it to also apply
the options' defaults (`asc` for select). All of them throw if `from` or `to` is not a number or is
`NaN`, or if `to` is lower than `from`. The `Normalized*` types are the corresponding
`Required<...>` options.
