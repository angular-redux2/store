# Middleware

Redux middleware sees every action before a reducer runs. Pass it as the `middleware` option:

```ts
import type { Middleware } from 'redux';
import { provideNgRedux } from '@angular-redux2/store';

const logger: Middleware = store => next => action => {
    console.log('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());

    return result;
};

provideNgRedux({ reducer: rootReducer, middleware: [ logger ] });
```

The store applies the middleware first, then the `enhancers`, then [Redux DevTools](/store/devtools), so the extension
records the actions that a middleware dispatches. `dispatch` returns what the middleware returns.

## Thunks

`dispatch` is typed for plain actions, so TypeScript rejects a thunk. Dispatch it through the Redux store, typed with
the thunk middleware's own types, or cast it:

```ts
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

const dispatch = <ThunkDispatch<AppState, unknown, UnknownAction>> store.redux.dispatch;
const user = await dispatch(loadUser('bob'));
```

A sub-store hands a thunk to the root store unchanged, and returns what the middleware returns. The thunk's `dispatch`
and `getState` are the root store's, so an action it dispatches reaches the root reducer, not the sub-store reducer.

::: warning 🔁 Changed from 5.x
In 5.x, `middleware` meant reducer middleware with the signature `(state, action, next)`. That form is gone. Wrap the
root reducer instead, which works with any Redux tool:

```ts
const stampLastAction = (reducer: Reducer<AppState>): Reducer<AppState> =>
    (state, action) => ({ ...reducer(state, action), lastAction: action.type });

provideNgRedux({ reducer: stampLastAction(rootReducer) });
```

:::

## See also

- [NgRedux](/store/ng-redux)
- [DevTools](/store/devtools)
- [Migrating from 5.x](/migration/decorators)
