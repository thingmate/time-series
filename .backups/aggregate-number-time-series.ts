// aggregate(
//   options: TimeSeriesAggregateOptions,
//   aggregator: TimeSeriesAggregator<GValue>,
// ): AggregatedTimeSeriesEntry<GValue> | null {
//   const { from, to, replace } = normalizeTimeSeriesAggregateOptions(options);
//
//   const entries: readonly TimeSeriesEntry<GValue>[] = this.select({ from, to, asc: true });
//
//   if (entries.length <= 1) {
//     return null;
//   }
//
//   const aggregatedEntry: AggregatedTimeSeriesEntry<GValue> = aggregator(entries, { from, to });
//
//   if (aggregatedEntry.from < from || aggregatedEntry.from > to) {
//     throw new Error(
//       `Invalid aggregated "from" range: ${aggregatedEntry.from}, expected: [${from}, ${to}] .`,
//     );
//   }
//
//   if (aggregatedEntry.to < aggregatedEntry.from || aggregatedEntry.to > to) {
//     throw new Error(
//       `Invalid aggregated "to" range: ${aggregatedEntry.to}, expected: [${aggregatedEntry.from}, ${to}] .`,
//     );
//   }
//
//   if (replace) {
//     this.delete({ from: aggregatedEntry.from, to: aggregatedEntry.to - 1 });
//     this.insert([
//       {
//         time: aggregatedEntry.from,
//         value: aggregatedEntry.value,
//       },
//     ]);
//   }
//
//   return aggregatedEntry;
// }
//
// aggregateAverage(options: TimeSeriesAggregateOptions): AggregatedTimeSeriesEntry<GValue> | null {
//   if (this.typeName !== 'int64' && this.typeName !== 'float64') {
//     throw new Error(`Invalid type: ${this.typeName}.`);
//   }
//
//   return this.aggregate(
//     options,
//     (entries: readonly TimeSeriesEntry<GValue>[]): AggregatedTimeSeriesEntry<GValue> => {
//       const from: number = entries[0].time;
//       const to: number = entries[entries.length - 1].time;
//       let value: number = 0;
//       let totalDuration: number = 0;
//
//       for (let i: number = 0, l: number = entries.length - 1; i < l; i++) {
//         const entryA: TimeSeriesEntry<GValue> = entries[i];
//         const entryB: TimeSeriesEntry<GValue> = entries[i + 1];
//         const duration: number = entryB.time - entryA.time;
//         value += entryA.value * duration;
//         totalDuration += duration;
//       }
//
//       value /= totalDuration;
//
//       if (this.typeName === 'int64') {
//         value = Math.round(value);
//       }
//
//       return {
//         from,
//         to,
//         value,
//       };
//     },
//   );
// }
//
// aggregateConcat({
//   separator = '\n',
//   ...options
// }: TimeSeriesAggregateConcatOptions): AggregatedTimeSeriesEntry<GValue> | null {
//   if (this.typeName !== 'text') {
//     throw new Error(`Invalid type: ${this.typeName}.`);
//   }
//
//   return this.aggregate(
//     options,
//     (entries: readonly TimeSeriesEntry<GValue>[]): AggregatedTimeSeriesEntry<GValue> => {
//       const from: number = entries[0].time;
//       const to: number = entries[entries.length - 1].time;
//       let value: string = '';
//
//       for (let i: number = 0; i < entries.length; i++) {
//         if (i !== 0) {
//           value += separator;
//         }
//         value += entries[i].value;
//       }
//
//       return {
//         from,
//         to,
//         value,
//       };
//     },
//   );
// }
