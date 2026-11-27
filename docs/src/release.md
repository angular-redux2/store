# Release Notes

What changed in the notable releases of `@angular-redux2/store`. The current line is `v6.0.x`.

## v6.0.1

- **Fixed**: An application that installed 6.0.0 failed to build with `Could not resolve "@services/ng-redux.service"`
  and similar errors. The published bundle imported the library's own files through internal path aliases instead of
  including them, so `@angular-redux2/store` and `@angular-redux2/store/mocks` are self-contained again.
- **Fixed**: The published types resolve again. They imported the same internal aliases, so `NgRedux` lost its
  members, `select` and `select$` were reported as missing, and selector parameters were typed as implicit `any`.
- **Migration**: Update from 6.0.0 to 6.0.1. The API is unchanged, so no application code changes.

## v6.0.0

Version 6 rebuilds the store on Angular signals. The state is a signal, every selection is a `computed`, and the
decorators move to a separate package. See [Migrating from 5.x](/migration/decorators) for the reasons and a
side-by-side guide. [Design decisions](/design) explains what was removed and what was left out, and
[Benchmarks](/benchmarks) compares it with 5.0.2.

```ts
export class Counter {
    readonly count = injectSelect((state: AppState) => state.counter);
}
```

- **Added**: [`NgRedux.state`](/store/ng-redux#state) holds the whole state as a signal, and
  [`select`](/store/ng-redux#select) returns a `computed` over it. Neither needs a subscription, an injection context,
  or a `tsconfig.json` setting.
- **Added**: [`select$`](/store/ng-redux#select-observable) returns an observable that emits every change
  synchronously, for RxJS pipelines.
- **Added**: [`injectSelect`](/store/ng-redux#injectselect) and [`injectSubstore`](/store/sub-store#in-a-component)
  for components. A sub-store path can be a function, so a sub-store follows a signal input.
- **Added**: [`createSlice`](/reducers/slices) builds a reducer and typed action creators from one handler per action,
  and [`createAction`](/reducers/slices#createaction) builds a creator for a single type. Both keep a falsy payload.
  Slice handlers get [draft state](/reducers/draft-state), so they can mutate
  ([#2](https://github.com/angular-redux2/store/issues/2), [#10](https://github.com/angular-redux2/store/issues/10)).
- **Added**: [`provideNgRedux`](/guide#configure-the-store) creates the store in one call. Its options are the reducer,
  the initial state, Redux [middleware](/store/middleware), enhancers, [Redux DevTools](/store/devtools),
  [`freeze`](/store/ng-redux#freezing-the-state), and [`transferState`](/store/ng-redux#server-side-rendering).
- **Added**: [`provideNgReduxFeature`](/store/ng-redux#addreducer) adds a slice for a lazy route.
- **Added**: [`freezeReducer`](/store/ng-redux#freezing-the-state) deep-freezes every state that a reducer returns.
- **Added**: [`destroy`](/store/sub-store#destroying-a-sub-store) on a sub-store, so the store forgets the reducer of
  sub-stores that are gone. `injectSubstore` calls it when its component is destroyed.
- **Added**: [`provideMockNgRedux`](/testing/mocks) and a state-based `MockNgRedux`: the test sets the state and reads
  the recorded dispatches.
- **Changed**: Faster across the board. A dispatch runs a plain reducer and sets one signal, and a selector runs only
  when something reads it. Against 5.0.2, 1,000 dispatches take 0.56 ms instead of 287 ms, and 1,000 selections over
  100 dispatches take 1.1 to 4 ms instead of 54 ms. See [Benchmarks](/benchmarks).
- **Changed**: [Signals](/store/signals) are built in. A selection works with `computed`, `effect`, `linkedSignal`,
  signal inputs, OnPush, and zoneless change detection.
- **Changed**: `select` returns a `Signal` instead of an `Observable`. [`select$`](/store/ng-redux#select-observable) is
  the observable form, and the comparator argument is now the `equal` option.
- **Changed**: The store is created ready, the first time something injects it, so no initializer has to run first.
- **Changed**: A selector is always a function. String keys and path arrays could not be typed.
- **Changed**: [Draft state](/reducers/draft-state) is opt-in through `draft` and slices. A plain reducer is a plain
  Redux reducer again. Setting a value back to what it was now keeps the previous state.
- **Changed**: A sub-store action reaches only its own reducer, and carries a serializable route, so Redux DevTools
  records and replays it.
- **Changed**: Built and tested against Angular 22, TypeScript 6, RxJS 7.8, and Redux 5. The peer ranges are
  `@angular/core` 20 and later, `rxjs` `^7.5.0`, and `redux` `^5.0.0`.
- **Fixed**: A plain object from another realm, such as an iframe or a jsdom test, counts as plain, so `draft` and
  `freeze` no longer skip it.
- **Fixed**: A `null` value in the state no longer throws when a reducer reads it
  ([#34](https://github.com/angular-redux2/store/issues/34), [#29](https://github.com/angular-redux2/store/pull/29)),
  and a `Date`, `Map`, `Set`, or class instance reaches a
  draft reducer as it is ([#31](https://github.com/angular-redux2/store/pull/31)).
- **Fixed**: A reducer that keeps a draft object in a new place, such as an undo history, stores the plain object and
  never the draft ([#24](https://github.com/angular-redux2/store/pull/24)).
- **Fixed**: `select$` emits once on subscribe and stays quiet until its value changes
  ([#3](https://github.com/angular-redux2/store/issues/3)).
- **Fixed**: `MockNgRedux` serves the state that the test sets, so a selector stub no longer depends on the text of its
  function, which coverage tools rewrite ([#9](https://github.com/angular-redux2/store/issues/9)).
- **Fixed**: A store works with RxJS `from(store)` without a `Symbol.observable` polyfill, see
  [Interop observable](/store/ng-redux#interop-observable).
- **Fixed**: A lazy feature starts from its key in the initial state, such as state that `transferState` brought from
  the server, instead of the default of its reducer.
- **Fixed**: `MockNgRedux.setState` and `patchState` set the key of a feature reducer.
- **Fixed**: A thunk dispatched through a sub-store reaches the thunk middleware unchanged.
- **Removed**: `@Select`, `@Select$`, `@Dispatch`, and `@Substore`. They live on in `@angular-redux2/decorators`, see
  [Keep the decorators](/migration/decorators#keep-the-decorators-with-angular-redux2-decorators).
- **Removed**: `AbstractReducer`, `@Action`, and `ReducerActionsType`, replaced by `createSlice`.
- **Removed**: `NgReduxModule`, `configureStore`, `provideStore`, `replaceStore`, the static `NgRedux.store`,
  `DevToolsExtension`, and reducer middleware. `NgRedux` keeps the underlying Redux store as `redux`.
- **Removed**: `subscribe`, replaced by `select$`, an `effect`, or `store.redux.subscribe`.
- **Removed**: `replaceReducer`, replaced by [`addReducer`](/store/ng-redux#addreducer) and `provideNgReduxFeature`.
- **Removed**: `configureSubStore`, replaced by [`substore`](/store/sub-store).
- **Removed**: `MockNgReduxModule`, `getSelectorStub`, and `getSubStore`, replaced by `provideMockNgRedux`.
- **Migration**: Follow [Migrating from 5.x](/migration/decorators). To move one component at a time, add
  `@angular-redux2/decorators` and change its imports first.
- **Migration**: An application on Angular 19 or earlier stays on [`v5.0.x`](/v5.0.x/guide).
- **Thanks**: Feature reducers, state freezing, state transfer, and the `null` and `Date` fixes came from reviewing the
  [`angular-redux3/store`](https://github.com/angular-redux3/store) fork. [Design decisions](/design#what-was-not-added)
  lists what else it adds and why version 6 leaves it out.

## Earlier releases

- [v5.0.x](/v5.0.x/release) - the rewrite around `AbstractStore`: class reducers, draft state, reducer middleware, and
  the `mocks` entry point (archived docs).
- [v4.0.x](/v4.0.x/release) - the first `@angular-redux2/store` line, with tab sync and the `testing` entry point
  (archived docs).

## See also

- [Getting Started](/guide)
- [Migrating from 5.x](/migration/decorators)
