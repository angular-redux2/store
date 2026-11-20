# Release Notes

::: warning 🗄️ Archived version
These are the notes for an archived version. See the [current release notes](/v6.0.x/release) for the supported line,
which moves the library to Angular 22.
:::

What changed in the `v5.0.x` line of `@angular-redux2/store`. For the lines before it see
[Earlier releases](#earlier-releases).

## v5.0.2

- **Fixed**: A [draft state](/reducers/draft-state) write nested more than one level deep lost its path. The path of
  the property being written was read from a misspelled field, so it always came back empty.

## v5.0.1

- **Fixed**: A [class reducer](/reducers/class-reducers) method that mutated its state and returned nothing made the
  reducer return `undefined`, which `combineReducers` rejects. It returns the previous state now, which the draft
  carries the mutation on.
- **Fixed**: A [draft state](/reducers/draft-state) write flagged a change even when the reducer had only read the
  state, so every action produced a new root object.
- **Added**: `set` accepts `symbol` keys in its path.
- **Added**: `get`, `set`, and `shallowCopy` are exported from the package root.

## v5.0.0

A rewrite of the store around one abstract base shared by the root store and its sub-stores.

- **Added**: [Class reducers](/reducers/class-reducers): `AbstractReducer`, the `@Action` decorator with no
  argument, and the `ActionCreator` and `ReducerActions` types.
- **Added**: [Draft state](/reducers/draft-state): reducers may mutate `state` in place.
- **Added**: [Reducer middleware](/store/middleware#reducer-middleware), passed as the third argument of
  `configureStore`.
- **Added**: [`@angular-redux2/store/mocks`](/testing/mocks) as the testing entry point, with `MockNgRedux` and
  `MockNgReduxModule`.
- **Changed**: `NgRedux` and `SubStoreService` both extend `AbstractStore`, so a [sub-store](/store/sub-store) offers
  the same `select`, `dispatch`, `getState`, and `subscribe`.
- **Changed**: [`@Substore`](/decorators/substore) reads the path from a `basePath` field instead of a
  `getBasePath()` method.
- **Changed**: The license is the Mozilla Public License 2.0.
- **Removed**: The cross-tab sync middleware, `deepCopy`, `createReducerFromClass`, and the `/testing` entry point.
- **Migration**:
  - Redux middleware moves from the third argument of `configureStore` into an enhancer:
    `configureStore(reducer, state, [], [ applyMiddleware(...middleware) ])`.
  - `provideStore(store)` takes the root reducer first: `provideStore(rootReducer, store)`.
  - Rewrite `@Action('TYPE')` methods on a plain class as a class that extends `AbstractReducer`, with bare `@Action`
    methods that receive the payload, and build it with `createReducer`.
  - Import mocks from `@angular-redux2/store/mocks`.

## Earlier releases

- [v4.0.x](/v4.0.x/release) - the first `@angular-redux2/store` line (archived docs).

## See also

- [Getting Started](/guide)
- [NgRedux](/store/ng-redux)
