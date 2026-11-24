# Design Decisions

Version 6 is smaller than 5.x on purpose. This page explains what was removed, what was not added, and why. Each
decision follows from three goals:

- **Signals first.** The state is a signal, and everything else is built on it, see [Signals](/store/signals).
- **Typed by default.** An API that TypeScript cannot check does not ship.
- **Plain Redux underneath.** Any Redux reducer, middleware, enhancer, or tool keeps working.

## What was removed

### Decorators

`@Select`, `@Select$`, `@Dispatch`, and `@Substore` move to `@angular-redux2/decorators`. They needed
`"useDefineForClassFields": false`, which new Angular projects do not set, and without it every `@Select` silently read
`undefined`. They also needed a global store, because a decorator cannot call `inject`, and could not check their
selectors. `injectSelect` and `injectSubstore` replace them with typed functions. See
[Migrating from 5.x](/migration/decorators#why-the-decorators-left-the-core).

### The static NgRedux.store

The decorators read the store from a static field. With one static store, two applications on a page, or two
server-side renders running at once, shared one state. Version 6 has only the injected store, so each application and
each render gets its own.

### String and path selectors

`select('counter')` and `select([ 'users', 'bob' ])` returned `unknown` to TypeScript, and a typo in the string failed
silently. A function selector is checked and inferred, so only the function form exists. See
[Selectors](/store/selectors).

### Automatic draft state on every reducer

5.x ran every reducer on a proxy of the state, then walked the whole state after each change to strip the proxies out.
That cost grew with the state on every dispatch, see [Benchmarks](/benchmarks), and the proxies caused a series of
bugs: `null` values ([#34](https://github.com/angular-redux2/store/issues/34)), `Date` objects
([#31](https://github.com/angular-redux2/store/pull/31)), and proxies left in undo histories
([#24](https://github.com/angular-redux2/store/pull/24)). In version 6 a reducer is a plain Redux reducer, and
[`draft`](/reducers/draft-state) and [slices](/reducers/slices) opt in to mutable-style updates that copy only what
they touch.

### configureStore, provideStore, and NgReduxModule

In 5.x the store existed before it was configured, so code that ran too early hit an empty store. Version 6 builds the
store in its constructor from the `provideNgRedux` options, so the store is ready the moment it is injected, and there
is no module to import.

### replaceStore

`replaceStore` put a Redux store built elsewhere under `NgRedux`. To route sub-store and feature actions, `NgRedux` has
to own the reducer of its Redux store, so a foreign store would have its reducer replaced behind its back, and the feature
needed fixes of its own ([#33](https://github.com/angular-redux2/store/pull/33)). Pass the pieces through the `middleware` and
`enhancers` options instead, and use [`redux`](/store/ng-redux#redux) where a library needs the Redux store itself.

### subscribe and replaceReducer

`NgRedux` no longer poses as a Redux `Store`. `subscribe` is replaced by [`select$`](/store/ng-redux#select-observable)
or an [`effect`](/store/signals#side-effects-with-effect), which select what they need. `replaceReducer` would remove the
routing of sub-stores and features, so [`addReducer`](/store/ng-redux#addreducer) adds a reducer instead. The Redux
store is still there as `store.redux`.

### Reducer middleware

The 5.x `middleware` option took a custom `(state, action, next)` form that only this library understood. It now takes
standard Redux middleware. To change what a reducer returns, wrap the reducer, see [Middleware](/store/middleware).

### Class reducers and @Action

`AbstractReducer` with `@Action` needed a class, a decorator, and a separate type declaration for the action creators.
[`createSlice`](/reducers/slices) builds the reducer and typed creators from one object.

### Selector stubs in mocks

`MockNgRedux.getSelectorStub` matched selectors by the text of their function, which broke when a coverage tool
rewrote the function ([#9](https://github.com/angular-redux2/store/issues/9)). The mock now holds real state, and every
selector reads it. See [Mocks](/testing/mocks).

## What was not added

The [`angular-redux3/store`](https://github.com/angular-redux3/store) fork added many features to the 5.x line. Some
are in version 6 in a different form. Feature reducers, state freezing, state transfer for server-side rendering, the
`null` and `Date` fixes, and signal selections all came from reviewing the fork. The rest are left out:

| Fork feature                                              | In version 6                                                                                                            |
|-----------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| `selectSignal`, `storeSignal`, `computedFromStore`        | Built in: [`select`](/store/ng-redux#select) is a signal, combine with `computed`                                       |
| `linkedStoreSignal`                                       | Angular's own [`linkedSignal`](/store/signals#an-editable-copy-with-linkedsignal)                                       |
| `@SelectSignal`                                           | `injectSelect`, or `@angular-redux2/decorators`                                                                         |
| `ZonelessNgRedux`, `provideNgReduxZoneless`               | Not needed: signals schedule change detection without Zone                                                              |
| `LazyReducer`, `ReducerRegistry`                          | [`provideNgReduxFeature`](/store/ng-redux#addreducer)                                                                   |
| `deepFreeze`, hydration helpers                           | The [`freeze`](/store/ng-redux#freezing-the-state) and [`transferState`](/store/ng-redux#server-side-rendering) options |
| `createTestStore`, `createSpyStore`, `createSelectorStub` | [`provideMockNgRedux`](/testing/mocks)                                                                                  |
| `ComponentStoreSlice`                                     | [`injectSubstore`](/store/sub-store#in-a-component), which follows the component                                        |
| `createFeatureSelector`                                   | A function selector, `state => state.todos`, is already typed                                                           |
| `createActionGroup`, `createTypedAction`                  | [`createSlice`](/reducers/slices) and [`createAction`](/reducers/slices#createaction)                                   |
| `createSelector`                                          | Each selection is a memoized `computed`                                                                                 |
| HMR support                                               | Built on webpack's `module.hot`, which the Angular CLI no longer uses                                                   |
| `StoreActionTracker`                                      | The [Redux DevTools](/store/devtools) extension records the same                                                        |
| `rxEffect`, `rxActionEffect`                              | Not in 6.0, see below                                                                                                   |
| `EntityAdapter`                                           | Not in 6.0, see below                                                                                                   |

**Action effects.** The fork read the action stream by replacing `store.dispatch` on the instance, which breaks when
two of them stack, as its own later fixes show. Reacting to state is covered by `effect`. For reacting to actions, use
an established Redux middleware such as `redux-thunk` or `redux-observable` through the
[`middleware`](/store/middleware) option.

**Entity adapters.** A normalized-collection helper is useful but large, and not every application needs it. It
belongs in its own entry point rather than in the core.

## See also

- [Migrating from 5.x](/migration/decorators)
- [Signals](/store/signals)
- [Benchmarks](/benchmarks)
- [Release Notes](/release)
