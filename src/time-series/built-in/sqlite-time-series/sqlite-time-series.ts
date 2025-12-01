import { DatabaseSync, type StatementSync } from 'node:sqlite';
import { indent, type Lines } from '../../../lines/lines.ts';
import { TimeSeries } from '../../time-series.ts';
import { normalizeTimeSeriesDeleteOptions } from '../../types/methods/delete/normalized-time-series-delete-options.ts';
import { type TimeSeriesDeleteOptions } from '../../types/methods/delete/time-series-delete-options.ts';
import { normalizeTimeSeriesSelectOptions } from '../../types/methods/select/normalized-time-series-select-options.ts';
import { type TimeSeriesSelectOptions } from '../../types/methods/select/time-series-select-options.ts';
import { type TimeSeriesEntry } from '../../types/time-series-entry.ts';
import { type TimeSeriesTypeName } from '../../types/time-series-types-map.ts';

const TIME_SERIES_TYPE_NAME_TO_SQLITE_TYPE_MAP: Record<TimeSeriesTypeName, string> = {
  int64: 'INTEGER',
  float64: 'REAL',
  text: 'TEXT',
  any: 'ANY',
};

export class SqliteTimeSeries<GTypeName extends TimeSeriesTypeName> extends TimeSeries<GTypeName> {
  readonly #db: DatabaseSync;
  readonly #insertSingle: StatementSync;

  constructor(path: string, typeName: GTypeName) {
    super(typeName);
    this.#db = new DatabaseSync(path);

    this.drop();

    this.#db.exec(`
      CREATE TABLE IF NOT EXISTS data(
        time INTEGER NOT NULL PRIMARY KEY,
        value ${TIME_SERIES_TYPE_NAME_TO_SQLITE_TYPE_MAP[this.typeName]} NOT NULL
      ) STRICT, WITHOUT ROWID
    `);

    this.#insertSingle = this.#db.prepare('INSERT INTO data (time, value) VALUES (?, ?);');
  }

  insert(entries: readonly TimeSeriesEntry<GTypeName>[]): void {
    if (entries.length === 0) {
      return;
    } else if (entries.length === 1) {
      this.#insertSingle.run(entries[0].time, entries[0].value);
    } else if (entries.length <= 1e4) {
      const values: any[] = new Array(entries.length * 2);

      let query: string = `INSERT INTO data (time, value) VALUES `;

      for (let i: number = 0, j: number = 0; i < entries.length; i += 1) {
        const { time, value } = entries[i];
        values[j++] = time;
        values[j++] = value;

        if (i !== 0) {
          query += ',';
        }
        query += '(?, ?)';
      }

      query += ';';

      this.#db.prepare(query).run(...(values as any));
    } else {
      for (let i: number = 0; i < entries.length; i += 1e4) {
        this.insert(entries.slice(i, i + 1e4));
      }
    }
  }

  select(options?: TimeSeriesSelectOptions): TimeSeriesEntry<GTypeName>[] {
    const { from, to, asc } = normalizeTimeSeriesSelectOptions(options);

    return this.#db
      .prepare(
        [
          'SELECT *',
          ...indent([
            'FROM data',
            ...((): Lines => {
              const whereLines: Lines = [
                ...(from !== Number.NEGATIVE_INFINITY ? [`time >= ${from}`] : []),
                ...(to !== Number.POSITIVE_INFINITY ? [`time <= ${to}`] : []),
              ];

              return whereLines.length > 0
                ? [
                    'WHERE',
                    ...indent(
                      whereLines.map((line: string, index: number): string => {
                        return index === 0 ? line : `AND ${line}`;
                      }),
                    ),
                  ]
                : [];
            })(),
            `ORDER BY time ${asc ? 'ASC' : 'DESC'}`,
          ]),
        ].join('\n'),
      )
      .all() as unknown as TimeSeriesEntry<GTypeName>[];
  }

  override delete(options?: TimeSeriesDeleteOptions): void {
    const { from, to } = normalizeTimeSeriesDeleteOptions(options);

    this.#db
      .prepare(
        [
          'DELETE',
          ...indent([
            'FROM data',
            ...((): Lines => {
              const whereLines: Lines = [
                ...(from !== Number.NEGATIVE_INFINITY ? [`time >= ${from}`] : []),
                ...(to !== Number.POSITIVE_INFINITY ? [`time <= ${to}`] : []),
              ];

              return whereLines.length > 0
                ? [
                    'WHERE',
                    ...indent(
                      whereLines.map((line: string, index: number): string => {
                        return index === 0 ? line : `AND ${line}`;
                      }),
                    ),
                  ]
                : [];
            })(),
          ]),
        ].join('\n'),
      )
      .run();
  }

  // https://stackoverflow.com/questions/1342898/function-to-calculate-median-in-sql-server
  // https://www.w3schools.com/sql/sql_avg.asp

  override drop(): void {
    this.#db.exec(`
      DROP TABLE IF EXISTS data
    `);
  }

  [Symbol.dispose](): void {
    return this.#db[Symbol.dispose]();
  }
}

/*--------*/

// https://github.com/pastgift/sqlstring-sqlite-js/blob/master/lib/SqlString.js#L189
// https://github.com/mysqljs/sqlstring/blob/master/lib/SqlString.js
// var CHARS_GLOBAL_REGEXP = /[']/g;
// var CHARS_ESCAPE_MAP    = {
//   '\'': '\'\'',
// };
//
// function escapeString(val) {
//   var chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex = 0;
//   var escapedVal = '';
//   var match;
//
//   while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
//     escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]];
//     chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
//   }
//
//   if (chunkIndex === 0) {
//     // Nothing was escaped
//     return "'" + val + "'";
//   }
//
//   if (chunkIndex < val.length) {
//     return "'" + escapedVal + val.slice(chunkIndex) + "'";
//   }
//
//   return "'" + escapedVal + "'";
// }
