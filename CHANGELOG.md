# @thingmate/time-series

## 1.0.0 (2026-11-27)

### Major Changes

- Stabilized the 1.0.0 API: time-series capabilities are now exposed as composable single-method `Having*` ability interfaces (`push`, `insert`, `select`, `delete`, `drop`, `flush`), aggregated in `HavingTimeSeriesAbilities`, so implementations can be typed on the exact subset they support. `computeNumberTimeSeriesDerivative` no longer throws on empty or single-entry time series, and time-range validation now reports the accurate accepted `"from"` range. The README was rewritten with usage examples, an options reference, and documentation of the abilities and helpers. ([#2](https://github.com/thingmate/time-series/pull/2))
