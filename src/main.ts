import { Path } from '@xstd/path';
import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SqliteTimeSeries } from './time-series/built-in/sqlite-time-series/sqlite-time-series.ts';
import { TimeSeries } from './time-series/time-series.ts';
import { type TimeSeriesEntry } from './time-series/types/time-series-entry.ts';

const ROOT_PATH = new Path(fileURLToPath(import.meta.url)).concat('../..');
const DB_PATH = ROOT_PATH.concat('db/main.db');

/*
DOC:
https://www.sqlite.org/datatype3.html
 */
async function main(): Promise<void> {
  await mkdir(DB_PATH.dirname().toString(), { recursive: true });
  await rm(DB_PATH.toString(), { force: true });

  using timeSeries = new SqliteTimeSeries(DB_PATH.toString(), 'int64');

  const size: number = 1e3;

  const minute: number = 60 * 1000;
  const hour: number = 60 * minute;
  const now: Date = new Date();

  const from: number = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes() - size,
  ).getTime();

  console.time('insert');
  // for (let i: number = 0; i < size; i++) {
  //   timeSeries.push(i, i);
  // }

  timeSeries.insert(
    Array.from({ length: size }, (_, i: number): TimeSeriesEntry<'int64'> => {
      return {
        time: from + i * minute,
        value: i,
      };
    }),
  );
  console.timeEnd('insert');

  console.time('select');
  const rows = timeSeries.select({
    from: Date.now() - minute * 10,
    to: Date.now(),
  });
  console.timeEnd('select');

  console.log(rows);

  // console.time('delete');
  // timeSeries.delete({
  //   from: -10,
  //   to: Date.now(),
  // });
  // console.timeEnd('delete');

  console.time('aggregate');
  TimeSeries.repeat(TimeSeries.every({ from, to: Date.now(), step: hour }), (timeRange) => {
    timeSeries.aggregateAverage({
      ...timeRange,
      replace: true,
    });
  });
  // const aggregated = timeSeries.aggregateAverage({
  //   from: -10,
  //   to: Date.now(),
  //   replace: true,
  // });
  console.timeEnd('aggregate');

  // console.log(aggregated);
  console.log(timeSeries.select());
}

main();
