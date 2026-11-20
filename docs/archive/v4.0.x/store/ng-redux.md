# NgRedux

`NgRedux` is the injectable store. It wraps one Redux store and exposes it as RxJS observables, and it is the store the
[decorators](/decorators/select) reach when they are not scoped to a [sub-store](/store/sub-store).

## configureStore

```ts
configureStore(
    rootReducer: Reducer<RootState, AnyAction>,
    initState: RootState,
    middleware: Array<Middleware> = [],
    enhancers: Array<StoreEnhancer<RootState>> = []
): void
```

Creates the Redux store. `middleware` is ordinary Redux middleware, applied with `applyMiddleware` before the enhancers.
A second call throws `Store already configured!`.

```ts
import { createLogger } from 'redux-logger';

ngRedux.configureStore(rootReducer, INITIAL_STATE, [ createLogger() ]);
```

## provideStore

```ts
provideStore(store: Store<RootState>): void
```

Adopts a Redux store created elsewhere, as it is.

::: warning Sub-stores need `configureStore`
`provideStore` does not wrap the store's reducer, so [sub-store](/store/sub-store) reducers never run on a store
provided this way.
:::

## select and dispatch

```ts
select<SelectedType>(selector?: Selector<RootState, SelectedType>, comparator?: Comparator): Observable<SelectedType>
dispatch<A extends AnyAction>(action: A): A
```

`select` returns an observable of a slice of the state; [Selectors](/store/selectors) covers the selector forms.
`dispatch` re-enters the Angular zone when called from outside it, so templates update.

`getState`, `subscribe`, `replaceReducer`, and `configureSubStore` behave as in Redux and
[Sub-stores](/store/sub-store).

## Static access

`NgRedux.store` returns the injected instance, and the decorators use it. It throws
`NgRedux failed: did you forget to configure your store?` until `NgRedux` has been created.

## See also

- [Selectors](/store/selectors)
- [Sub-stores](/store/sub-store)
