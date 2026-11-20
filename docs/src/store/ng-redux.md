# NgRedux

`NgRedux` is the injectable store. It wraps one Redux store, feeds every state change into an RxJS stream, and is the
store the [decorators](/decorators/select) reach when they are not scoped to a [sub-store](/store/sub-store).

```ts
import { inject } from '@angular/core';
import { NgRedux } from '@angular-redux2/store';

const ngRedux = inject(NgRedux<AppStateInterface>);
```

`RootState` defaults to `unknown`, so give it the application's state type; without one, selections and reducers are
typed `unknown`. It is provided in root. The first instance created registers itself as the static [`NgRedux.store`](#static-access).

## configureStore

```ts
configureStore(
    reducer: Reducer<RootState>,
    initState: RootState,
    middleware: Array<MiddlewareInterface<RootState>> = [],
    enhancers: StoreEnhancer[] = []
): void
```

Creates the Redux store from a root reducer and an initial state. Call it once, before anything reads from the
store; a second call throws `Store already initialize!`.

| Parameter    | Notes                                                                                             |
|--------------|---------------------------------------------------------------------------------------------------|
| `reducer`    | The root reducer. It may mutate `state`, see [Draft state](/reducers/draft-state).                |
| `initState`  | The initial state.                                                                                |
| `middleware` | [Reducer middleware](/store/middleware#reducer-middleware), run in order before the root reducer. |
| `enhancers`  | Redux store enhancers, composed right to left: `applyMiddleware(...)`, the DevTools enhancer.     |

```ts
import { applyMiddleware } from 'redux';

ngRedux.configureStore(rootReducer, INITIAL_STATE, [], [ applyMiddleware(logger) ]);
```

## provideStore

```ts
provideStore(reducer: Reducer<RootState>, store: Store<RootState>): void
```

Adopts a Redux store created elsewhere. The store's reducer is replaced by `reducer`, wrapped so that sub-stores and
[draft state](/reducers/draft-state) work. Reducer middleware is not applied on this path. Like `configureStore`, it
throws when a store is already set.

## select

```ts
select<SelectedType>(selector?: SelectorType<RootState, SelectedType>, comparator?: ComparatorType<SelectedType>): Observable<SelectedType>
```

Returns an observable of a slice of the state. It replays the current value to a new subscriber, then emits whenever
the slice changes. With no selector it emits the whole state.

```ts
const counter$ = ngRedux.select<number>('counter');
const city$ = ngRedux.select<string>([ 'user', 'address', 'city' ]);
const total$ = ngRedux.select((state: AppStateInterface) => state.items.length);
```

[Selectors](/store/selectors) covers the three selector forms and how a `comparator` decides what counts as a change.

## selectSignal

```ts
selectSignal<SelectedType>(selector?: SelectorType<RootState, SelectedType>, comparator?: ComparatorType<SelectedType>): Signal<SelectedType>
```

Returns a read-only signal of a slice of the state. It takes the same selectors and comparator as `select`, needs no
subscription and no injection context, and recomputes only when the state changes. It reads `undefined` until the store
is configured, without calling the selector; [`provideNgRedux`](/guide#configure-the-store) configures the store before
the first component renders.

```ts
const counter = ngRedux.selectSignal<number>('counter');
const total = ngRedux.selectSignal((state: AppStateInterface) => state.items.length);
```

In a component, `injectSelect` is the shorthand for `inject(NgRedux).selectSignal(...)`:

```ts
export class CounterComponent {
    readonly counter = injectSelect<number>('counter');
}
```

A [sub-store](/store/sub-store) has `selectSignal` too, relative to its base path.

## dispatch

```ts
dispatch<Action extends UnknownAction>(action: Action): Action
```

Dispatches an action and returns it. It throws `Dispatch failed: store instance not initialize.` when no store is set.

A dispatch from outside the Angular zone, for example from a third-party callback, is run inside it through `NgZone`,
so templates update as they would for any event. In a zoneless application there is no zone to re-enter and the
dispatch runs as is.

## getState, subscribe, replaceReducer

| Method                             | Notes                                                                        |
|------------------------------------|------------------------------------------------------------------------------|
| `getState()`                       | The current state.                                                           |
| `subscribe(listener)`              | The Redux listener API; returns the function that unsubscribes.              |
| `replaceReducer(nextReducer)`      | Swaps the root reducer. Middleware and sub-store reducers stay as they were. |
| `configureSubStore(path, reducer)` | Carves out a [sub-store](/store/sub-store).                                  |

`NgRedux` also implements `Symbol.observable`, and the `'@@observable'` key that RxJS falls back to without a
polyfill, so `from(ngRedux)` gives the raw state stream.

## replaceStore

```ts
replaceStore(store: Store<RootState>): void
```

Swaps the Redux store that the service wraps. The service stops listening to the old store, and every selection,
observable or signal, continues with the new one. The store is used as given, so build it from the reducer this
service composed, for example during hot module replacement:
`ngRedux.replaceStore(createStore(rootReducer, ngRedux.getState()))`.

## addReducer

```ts
addReducer(key: string, reducer: Reducer): void
```

Adds a reducer that owns one top-level key of the state, next to the root reducer. A lazy route loads its reducer with
its code this way, so the root reducer does not have to list every feature. In a route, use the provider:

```ts
import { provideNgReduxFeature } from '@angular-redux2/store';

export const routes: Routes = [{
    path: 'todos',
    loadComponent: () => import('./todos.component'),
    providers: [ provideNgReduxFeature('todos', todosReducer) ]
}];
```

Once the store is configured, adding a reducer dispatches `ADD_REDUCER`, so the key holds the reducer's initial state
at once. The root reducer never sees the key, so `combineReducers` neither drops it nor warns about it, and the feature
reducer gets a [draft](/reducers/draft-state) of its own key. Adding the same reducer again does nothing, and a
different reducer for the key replaces it. The root state must be an object, and the key keeps its state after the
route is left.

## Freezing the state

```ts
provideNgRedux({ reducer: rootReducer, initialState: INITIAL_STATE, freeze: isDevMode() });
```

`freeze: true` adds the `freezeState()` enhancer, which deep-freezes the initial state and every state the root reducer
returns. Code that mutates the state outside a reducer, such as a component that changes an object it selected, then
throws a `TypeError` at the write instead of changing the store behind its back. Reducers are unaffected, since they
write to a [draft](/reducers/draft-state).

Only plain objects and arrays are frozen; a `Date`, `Map`, `Set`, or class instance is left as it is. The initial state
object is frozen in place. Freezing walks the new parts of the state after every action, so keep it to development. With
`configureStore`, pass the enhancer yourself:

```ts
import { freezeState } from '@angular-redux2/store';

ngRedux.configureStore(rootReducer, INITIAL_STATE, [], isDevMode() ? [ freezeState() ] : []);
```

## Server-side rendering

```ts
provideNgRedux({ reducer: rootReducer, initialState: INITIAL_STATE, transferState: true });
```

`transferState: true` carries the state from the server to the browser through Angular's `TransferState`. The server
puts the state as it is at render time into the page, and the browser store starts from it instead of `initialState`,
so the first render matches the server's and data the server loaded is not fetched again. Without server-side
rendering there is nothing to transfer and `initialState` is used.

::: warning 📦 JSON only
The state travels as JSON. A `Date` arrives as a string, and a `Map`, `Set`, or class instance does not survive, so
keep the state to plain data when this option is on.
:::

## Static access

`NgRedux.store` returns the instance the application injected. The decorators use it, and so can code that has no
injector at hand:

```ts
NgRedux.store.dispatch({ type: 'RESET' });
```

It throws `NgRedux failed: instance not initialize.` until `NgRedux` has been created, so the store is configured in an
initializer or root module before any decorated component renders.

## See also

- [Selectors](/store/selectors)
- [Sub-stores](/store/sub-store)
- [Middleware](/store/middleware)
- [DevTools](/store/devtools)
