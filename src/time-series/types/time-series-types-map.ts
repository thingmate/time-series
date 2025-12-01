export type TimeSeriesTypeEntry<GName extends string, GType> = readonly [name: GName, type: GType];

export type TimeSeriesTypesMap =
  | TimeSeriesTypeEntry<'int64', number>
  | TimeSeriesTypeEntry<'float64', number>
  | TimeSeriesTypeEntry<'text', string>
  | TimeSeriesTypeEntry<'any', any>;

export type TimeSeriesTypeName = TimeSeriesTypesMap[0];

export type InferTimeSeriesType<GTypeName extends TimeSeriesTypeName> = Extract<
  TimeSeriesTypesMap,
  TimeSeriesTypeEntry<GTypeName, any>
>[1];
