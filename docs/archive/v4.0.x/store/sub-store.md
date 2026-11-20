# Sub-stores

A sub-store is a store rooted at a path of the global state, with a reducer of its own. It offers `select`,
`dispatch`, `getState`, and `subscribe` relative to that path.

```ts
const bob = ngRedux.configureSubStore<UserInterface>([ 'users', 'bob' ], userReducer);

bob.select('name');                                // state.users.bob.name
bob.dispatch({ type: 'ADD_LOC', payload: 100 });   // reaches userReducer with state.users.bob
```

`configureSubStore` on a sub-store nests another one, its path appended to the parent's.

## How a dispatch is routed

A sub-store tags each action with its path and dispatches it on the root store. The tagged action is handed to the
reducer registered for that path with the state there, and the result is written back; the root reducer then runs on
the action as well.

::: warning One reducer per path
Reducers are registered by path. Configuring a second sub-store at the same path with a different reducer throws
`attempt to overwrite fractal reducer for basePath ...`. `replaceReducer` on a sub-store swaps the reducer at its path.
:::

Sub-store reducers run only on a store created with [`configureStore`](/store/ng-redux#configurestore).

## See also

- [@Substore](/decorators/substore)
- [NgRedux](/store/ng-redux)
