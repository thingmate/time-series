[![npm (scoped)](https://img.shields.io/npm/v/@thingmate/time-series.svg)](https://www.npmjs.com/package/@thingmate/time-series)
![npm](https://img.shields.io/npm/dm/@thingmate/time-series.svg)
![NPM](https://img.shields.io/npm/l/@thingmate/time-series.svg)
![npm type definitions](https://img.shields.io/npm/types/@thingmate/time-series.svg)

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
 * This interface extends partial time range capabilities.
 *
 * - `from` (optional, default: `Number.NEGATIVE_INFINITY`): specifies the starting point of the range.
 * - `to` (optional, default: `Number.POSITIVE_INFINITY`): specifies the endpoint (included) of the range.
 */
interface TimeSeriesDeleteOptions extends Partial<TimeSeriesTimeRange> {}
```
