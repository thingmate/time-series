import { Path } from '@xstd/path';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { QxTimeBucket } from '../../src/built-in/qx-time-series/qx-time-bucket.ts';
import { QxTimeSeries } from '../../src/built-in/qx-time-series/qx-time-series.ts';

const ROOT_PATH = new Path(fileURLToPath(import.meta.url)).dirname().concat('../..');
const DB_PATH = ROOT_PATH.concat('db/qx');

async function debugQxBucket_01() {
  await rm(DB_PATH.toString(), { force: true, recursive: true });

  await using bucket = new QxTimeBucket(DB_PATH.concat('buckets'), 0);

  await bucket.push(10, 1);
  await bucket.push(1, 2);
  await bucket.push(2, 3);
  await bucket.push(4, 4);

  await bucket.delete({ from: 4, to: 4 });

  // await bucket.push(5, 5);

  // console.log(await bucket.select({ from: 1, to: 4 }));
  console.log(await bucket.select());
  await bucket.flush();
}

async function debugQxBucket_02() {
  await rm(DB_PATH.toString(), { force: true, recursive: true });

  // const from: number = Date.now() / 1000;
  const from: number = 0;
  const to: number = from + 60 * 1000;

  await using series = await QxTimeSeries.open(DB_PATH);

  await series.push(from + 10, 1);
  await series.push(from + 1, 2);
  await series.push(from + 2, 3);
  await series.push(4, 4);
  await series.push(from + 600, 4);
  await series.push(from + 601, 5);

  // await series.delete({ from: -4, to: 4000 });

  await series.flush();
  console.log(await series.select({ from, to, asc: true }));
  // console.log(await series.select({ from: 512, to: 700, asc: false }));
  // console.log(await series.select());
}

async function debugQxBucket_03() {
  await rm(DB_PATH.toString(), { force: true, recursive: true });

  await using series = await QxTimeSeries.open(DB_PATH);

  console.time('push');
  for (let i = 0; i < 1e5; i++) {
    series.push(i, i);
  }
  await series.flush({ unload: false });
  console.timeEnd('push');

  // console.time('insert');
  // series.insert(Array.from({ length: 1e4 }, (_, i) => ({ time: i, value: i })));
  // await series.flush();
  // console.timeEnd('insert');

  console.time('select');
  const entries = await series.select({ from: 0, to: 1e6, asc: true });
  console.timeEnd('select');

  console.log(entries);
}

export async function debugQxBucket() {
  // await debugQxBucket_01();
  // await debugQxBucket_02();
  await debugQxBucket_03();
}
