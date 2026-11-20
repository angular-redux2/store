# Release Notes

What changed in the notable releases of `@angular-redux2/store`.

## v6.0.0

The library moves to the current Angular toolchain, adds signal selections, and fixes how class reducers route actions.

- **Added**: [`selectSignal`](/store/ng-redux#selectsignal) on `NgRedux` and every sub-store returns a selection as a
  read-only signal, and `injectSelect` is its decorator-free shorthand for components. Neither needs a subscription
  or the `useDefineForClassFields: false` setting that the decorators require.
- **Added**: [`replaceStore`](/store/ng-redux#replacestore) swaps the wrapped Redux store and keeps every selection
  live (from [#33](https://github.com/angular-redux2/store/pull/33)).
- **Added**: A static [`namespace`](/reducers/class-reducers#namespace) on a class reducer sets the prefix of its
  action types, so they survive a minifier that renames classes.
- **Added**: [`provideNgRedux`](/guide#configure-the-store) configures the store from the application config in one
  call, with the reducer, initial state, middleware, enhancers, and [Redux DevTools](/store/devtools) as options.
  `DevToolsExtension` is provided in root, so `NgReduxModule` is only needed by `NgModule` applications.
- **Fixed**: With the Redux DevTools panel open, a zoneless application crashed with `NG0101: ApplicationRef.tick is
  called recursively` when a component dispatched while Angular rendered, for example in `ngOnInit`. The extension
  integration re-enters the zone instead of forcing change detection.
- **Fixed**: `Symbol.observable` on a [sub-store](/store/sub-store) emits its state; it returned a stream that never
  emitted.
- **Changed**: Built and tested against Angular 22, TypeScript 6, RxJS 7.8, and Redux 5.
- **Changed**: The peer ranges follow what is built and tested: `@angular/core` 20 and later (an application built
  and tested on Angular 20, 21, and 22), `rxjs` `^7.5.0`, and
  `redux` `^5.0.0`. Node.js 20.19 or later is required. The bundle imports only `@angular/core`, `redux`,
  and `rxjs`, so the missing `broadcast-channel` and rxjs 6 errors of
  [#17](https://github.com/angular-redux2/store/issues/17) cannot occur.
- **Changed**: [`configureStore`](/store/ng-redux#configurestore) types `enhancers` as `StoreEnhancer[]`. It was
  `StoreEnhancer<RootState>[]`, which put the state type where Redux expects the store extension type, and Redux 5
  rejects it.
- **Removed**: The peer dependency on `@angular/common`, which the library never imports.
- **Changed**: The exported types follow the `Type` and `Interface` suffix convention: `PathSelectorType`,
  `PropertySelectorType`, `FunctionSelectorType`, [`SelectorType`](/store/selectors), `ComparatorType`,
  `TransformerType`, `PayloadActionInterface`, `ActionCreatorType`, [`ReducerActionsType`](/reducers/class-reducers),
  `NextMiddlewareInterface`, and [`MiddlewareInterface`](/store/middleware#reducer-middleware).
- **Changed**: The public types use `unknown` where they used `any`. `NgRedux`, `PayloadActionInterface`, and
  `MiddlewareInterface` default their type parameter to `unknown`; [`ComparatorType`](/store/selectors#comparator) and
  `NextMiddlewareInterface` take the type they compare or pass on; [`@Select` and `@Select$`](/decorators/select) infer
  the state type from a function selector's parameter; [`@Substore`](/decorators/substore) takes the reducer's state
  type; and [`enhancer()`](/store/devtools) returns `StoreEnhancer | null`.
- **Migration**: Rename the 5.x types to the names above: `PathSelector` to `PathSelectorType`, `PayloadAction` to
  `PayloadActionInterface`, `ReducerActions` to `ReducerActionsType`, `Middleware` to `MiddlewareInterface`, and so on.
- **Migration**: Give `NgRedux`, `MiddlewareInterface`, and `PayloadActionInterface` their type parameters, and
  annotate the parameter of a function selector: `@Select((state: AppStateInterface) => state.counter)`. Where a
  value really is untyped, cast it, for example `<BugInterface> action.payload`.
- **Fixed**: A [draft state](/reducers/draft-state) write no longer changes earlier states. Writes landed on the
  previous state's objects, all nested drafts shared one path, and a top-level write added an `undefined` key, so old
  snapshots changed under Redux DevTools and `===` selections missed updates. Each drafted object now gets its own
  copy, and only the path to a write is new in the result.
- **Fixed**: A `null` value in the state no longer throws `Cannot read properties of null (reading '_isProxy')` when
  a reducer reads it ([#34](https://github.com/angular-redux2/store/issues/34), from
  [#35](https://github.com/angular-redux2/store/pull/35) and [#29](https://github.com/angular-redux2/store/pull/29)).
- **Fixed**: A `Date`, `Map`, `Set`, or class instance in the state reaches the reducer as it is rather than wrapped in
  a proxy that broke its methods (from [#31](https://github.com/angular-redux2/store/pull/31)). Only plain objects
  and arrays are drafted.
- **Fixed**: [Sub-store](/store/sub-store) selections, and `@Select` on a [`@Substore`](/decorators/substore) class,
  emit. They stayed silent until something called `setBasePath`, which nothing did. A selection now follows the
  root store at the base path, and holds no subscription while nothing subscribes to it.
- **Fixed**: An [action creator](/reducers/class-reducers#action-creators) keeps a falsy payload such as `0`, `''`,
  or `false`; it was dropped.
- **Fixed**: Every [class reducer](/reducers/class-reducers) has its own action creators. They were all registered
  on one map shared through `AbstractReducer`, so two reducers with a method of the same name, such as `reset`,
  overwrote each other's creator.
- **Fixed**: A class reducer handles only its own namespaced types for `@Action` methods. A bare type such as `addBug`
  reached the method too, and a type naming `constructor` or an undecorated method called it.
- **Changed**: [`ActionCreatorType`](/reducers/class-reducers#action-creators) requires the payload when the method
  takes one, and `ReducerActionsType` maps only the methods of the class.
- **Removed**: The `get`, `set`, and `shallowCopy` helpers are no longer exported; they were internal.
- **Added**: [`MockNgRedux`](/testing/mocks#selector-stubs) stubs `selectSignal` as well, through the same stub as
  `select`, so a component under test that reads `injectSelect` shows the values a test pushes into the stub.
- **Changed**: The mocks' `_mockNgReduxFactory` is renamed `mockNgReduxFactory`.
- **Migration**: Dispatch class-reducer actions through their creators. Code that dispatched a bare method name, such
  as `{ type: 'addBug' }`, now needs `BugReducer.actions.addBug(...)` or the full `BugReducer/addBug` type.
- **Changed**: The public types use Redux 5's `UnknownAction` where they used the deprecated `AnyAction`, so an
  action's extra properties are `unknown` rather than `any`. Redux 4, which has no `UnknownAction`, is no longer
  supported.
- **Migration**: Replace `AnyAction` with `UnknownAction` in reducers, middleware, and `@Substore` reducers, and cast
  extra properties where they are read: `<string> action['name']`, or type the action as
  `PayloadActionInterface<Payload>`. An application on Redux 4 upgrades to Redux 5 first.
- **Migration**: An application on Angular 19 or earlier stays on [`v5.0.x`](/v5.0.x/guide).

## Earlier releases

- [v5.0.x](/v5.0.x/release) - the rewrite around `AbstractStore`: class reducers, draft state, reducer middleware, and
  the `mocks` entry point (archived docs).
- [v4.0.x](/v4.0.x/release) - the first `@angular-redux2/store` line, with tab sync and the `testing` entry point
  (archived docs).

## See also

- [Getting Started](/guide)
- [NgRedux](/store/ng-redux)
