# NgRedux

`NgRedux` is the root store. It wraps one Redux store and exposes its state as an Angular signal. Every selection is a
`computed` over that signal.

```ts
import { inject } from '@angular/core';
import { NgRedux } from '@angular-redux2/store';

const store = inject(NgRedux<AppState>);
```

[`provideNgRedux`](/guide#configure-the-store) creates the one instance for the application. The Redux store is built
in the constructor, so the store is ready the moment it is injected.

## constructor

```ts
new NgRedux<State>(config: NgReduxConfigInterface<State>)
```

Creates a store without dependency injection, such as in a script or a unit test. `config` takes the same options as
`provideNgRedux`, except `transferState`, which needs the injector:

```ts
const store = new NgRedux<AppState>({ reducer: rootReducer, initialState: INITIAL_STATE, freeze: true });
```

## state

```ts
readonly state: Signal<State>
```

The whole state as a read-only signal. It holds the new state as soon as `dispatch` returns.

## select

```ts
select<Selected>(selector: (state: State) => Selected, options?: CreateComputedOptions<Selected>): Signal<Selected>
```

Returns a read-only signal of one value. It is a `computed`, so it needs no subscription and no injection context, and
it runs the selector only when something reads it after a change. `options` are Angular's own `computed` options, so
`equal` decides what counts as a change. See [Selectors](/store/selectors).

```ts
const count = store.select(state => state.counter);
const total = store.select(state => state.todos.length);
```

In a component, [`injectSelect`](#injectselect) is the shorthand.

## select$ {#select-observable}

```ts
select$<Selected>(selector: (state: State) => Selected, options?: { equal?: (a: Selected, b: Selected) => boolean }): Observable<Selected>
```

Returns an observable that emits the current value on subscribe and then every change, synchronously, after each
dispatch. Reach for it in RxJS pipelines that must see each value in order. `toObservable(store.select(...))` emits
later and can skip values.

```ts
store.select$(state => state.query).pipe(
    debounceTime(300),
    switchMap(query => http.get(`/search?q=${ query }`))
);
```

## dispatch

```ts
dispatch<DispatchedAction extends Action>(action: DispatchedAction): DispatchedAction
```

Dispatches an action and returns what Redux returns, which is the action unless a middleware changes it.

## getState

```ts
getState(): State
```

Returns the current state without tracking it, so calling it in a `computed` or an `effect` does not make it rerun.

## substore

```ts
substore<SubState>(basePath: BasePathType, reducer: Reducer<SubState>): SubStoreInterface<SubState>
```

Creates a store for one branch of the state. `basePath` is a path array such as `[ 'users', 'bob' ]`, or a function
that returns one. Call `destroy()` on the sub-store when it is no longer needed, so the store can forget its reducer.
See [Sub-stores](/store/sub-store).

## addReducer

```ts
addReducer(key: string, reducer: Reducer): void
```

Adds a reducer that owns one top-level key, next to the root reducer, so a lazy route can bring its reducer with its
code. In a route, use the provider:

```ts
import { provideNgReduxFeature } from '@angular-redux2/store';

export const routes: Routes = [{
    path: 'todos',
    loadComponent: () => import('./todos'),
    providers: [ provideNgReduxFeature(todos) ]
}];
```

`provideNgReduxFeature` takes any `{ name, reducer }`, such as a [slice](/reducers/slices). The key holds the initial
state of its reducer at once. The root reducer never sees the key, so `combineReducers` neither drops it nor warns about
it. Adding the same reducer again does nothing, and a different reducer for the key replaces it.

When the initial state already has the key, such as state that [`transferState`](#server-side-rendering) brought from
the server, the feature starts from that value instead of its reducer's default, even though `combineReducers` dropped
the key when the store started.

## redux

```ts
readonly redux: Store<State>
```

The underlying Redux store, for libraries that expect one. Do not replace its reducer, because the root reducer also
runs sub-stores and features. Dispatch a thunk through `store.redux.dispatch` to keep its return type, see
[Middleware](/store/middleware#thunks).

## Interop observable

Every store, root or sub-store, is an interop observable, so RxJS `from(store)` emits the whole state on subscribe and
after every change, the same as `select$(state => state)`. It works with or without a `Symbol.observable` polyfill.

RxJS types `Symbol.observable` as a plain `symbol`, so TypeScript does not accept a store as an `ObservableInput`. In
TypeScript, use `select$`:

```ts
store.select$(state => state).subscribe(state => console.log(state)); // the same as from(store)
```

## injectSelect

```ts
injectSelect<State, Selected>(selector: (state: State) => Selected, options?: CreateComputedOptions<Selected>): Signal<Selected>
```

The shorthand for `inject(NgRedux).select(selector, options)`. Call it in a field initializer or a constructor:

```ts
export class Counter {
    readonly count = injectSelect((state: AppState) => state.counter);
}
```

## Freezing the state

```ts
provideNgRedux({ reducer: rootReducer, freeze: isDevMode() });
```

`freeze: true` deep-freezes every state that the store holds, including the states of sub-stores and features, and the
`initialState` object you pass, in place. Code that mutates the state, such as a component
that changes an object it selected or a plain reducer that writes to its input, then throws a `TypeError` at the
assignment instead of changing the store behind its back. [Slices](/reducers/slices) and [`draft`](/reducers/draft-state)
reducers keep working, because they write to copies.

Only plain objects and arrays are frozen. A `Date`, `Map`, `Set`, or class instance stays as it is. Freezing walks the
new parts of the state after every action, so keep it to development.

```ts
freezeReducer<State>(reducer: Reducer<State>): Reducer<State>
```

`freezeReducer` is the same thing as a reducer wrapper, for a store made without `provideNgRedux`.

## Server-side rendering

```ts
provideNgRedux({ reducer: rootReducer, initialState: INITIAL_STATE, transferState: true });
```

`transferState: true` carries the state from the server to the browser through Angular's `TransferState`. The server
writes the state into the page, and the browser starts from it instead of `initialState`, so the first render matches
and data that the server loaded is not fetched again. The state is stored under the exported `STATE_KEY`, so code that
needs to can read it from `TransferState` itself. A lazy feature starts from its key in the transferred state as well,
see [addReducer](#addreducer).

::: warning 📦 JSON only
The state travels as JSON. A `Date` arrives as a string, and a `Map`, `Set`, or class instance does not survive, so keep
the state to plain data when this option is on.
:::

## See also

- [Selectors](/store/selectors)
- [Sub-stores](/store/sub-store)
- [Middleware](/store/middleware)
- [DevTools](/store/devtools)
