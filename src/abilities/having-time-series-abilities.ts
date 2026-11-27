import type { HavingTimeSeriesDeleteAbility } from './methods/delete/having-time-series-delete-ability.ts';
import type { HavingTimeSeriesDropAbility } from './methods/drop/having-time-series-drop-ability.ts';
import type { HavingTimeSeriesFlushAbility } from './methods/flush/having-time-series-flush-ability.ts';
import type { HavingTimeSeriesInsertAbility } from './methods/insert/having-time-series-insert-ability.ts';
import type { HavingTimeSeriesPushAbility } from './methods/push/having-time-series-push-ability.ts';
import type { HavingTimeSeriesSelectAbility } from './methods/select/having-time-series-select-ability.ts';

/**
 * Aggregates all the abilities of a time series: inserting, pushing, selecting, deleting, dropping, and flushing entries.
 *
 * It also extends `AsyncDisposable`, so that pending operations are flushed when the time series is disposed.
 *
 * @template GValue - The type of the value associated with each timestamp.
 */
export interface HavingTimeSeriesAbilities<GValue>
  extends
    HavingTimeSeriesInsertAbility<GValue>,
    HavingTimeSeriesPushAbility<GValue>,
    HavingTimeSeriesSelectAbility<GValue>,
    HavingTimeSeriesDeleteAbility,
    HavingTimeSeriesDropAbility,
    HavingTimeSeriesFlushAbility,
    AsyncDisposable {}
