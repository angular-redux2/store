# Sub-stores

A sub-store is a store rooted at a path of the global state, with a reducer of its own. It offers the same `select`,
`dispatch`, `getState`, and `subscribe` as [`NgRedux`](/store/ng-redux), but everything it does is relative to its
path, which makes it a fit for a component that edits one entry of a collection.

```ts
const bob = ngRedux.configureSubStore<UserInterface>([ 'users', 'bob' ], userReducer);
bob.setBasePath([ 'users', 'bob' ]);

bob.select('name');                     // state.users.bob.name
bob.getState();                         // state.users.bob
bob.dispatch({ type: 'ADD_LOC', payload: 100 });
```

::: warning `select` waits for `setBasePath`
In this version a sub-store starts following its path only once `setBasePath(path)` has been called, and neither
`configureSubStore` nor [`@Substore`](/decorators/substore) calls it. Until then `select` and `subscribe` stay silent,
while `getState` and `dispatch` already work. Call `setBasePath` with the same path after creating the sub-store.
:::

## How a dispatch is routed

A sub-store tags each action it dispatches with its path and its reducer, then dispatches it on the root store. Before
the root reducer runs, the tagged action is handed to the sub-store's reducer with the state at the path, and the
result is written back there. An untagged action, dispatched on the root store, never reaches a sub-store reducer.

```ts
function userReducer(state: UserInterface, action: PayloadAction<number>): UserInterface {
    if (action.type === 'ADD_LOC') {
        state.loc += action.payload!;
    }

    return state;
}
```

The sub-store reducer gets [draft state](/reducers/draft-state) like the root reducer does, so it may mutate `state`.

::: info 🔑 Reducers are keyed by their source
A sub-store reducer is registered under a hash of its source text. Sub-stores whose reducers have the same source
share one registration, which is what lets many components use one reducer at different paths. The first registration
wins, and `replaceReducer` on any of them replaces it for all.
:::

## API

| Member                             | Notes                                                              |
|------------------------------------|--------------------------------------------------------------------|
| `select(selector?, comparator?)`   | A [selection](/store/selectors) relative to the path.              |
| `dispatch(action)`                 | Tags the action with the path and dispatches it on the root store. |
| `getState()`                       | The state at the path.                                             |
| `subscribe(listener)`              | Calls `listener` when the state at the path changes.               |
| `setBasePath(path)`                | Moves the sub-store to a new path.                                 |
| `configureSubStore(path, reducer)` | A nested sub-store; its path is appended to this one.              |
| `replaceReducer(reducer)`          | Swaps this sub-store's reducer.                                    |

## See also

- [@Substore](/decorators/substore) - a sub-store per component instance, from a decorator.
- [Draft state](/reducers/draft-state)
- [NgRedux](/store/ng-redux)
