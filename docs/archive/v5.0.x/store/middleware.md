# Middleware

There are two places to hook into a dispatch: Redux middleware, which wraps `dispatch`, and reducer middleware, which
wraps the reducer.

## Redux middleware

Ordinary Redux middleware sees every action before any reducer runs. Apply it with `applyMiddleware` and pass the
result as an enhancer:

```ts
import { applyMiddleware } from 'redux';
import type { Middleware } from 'redux';

const logger: Middleware = store => next => action => {
    console.log('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());

    return result;
};

ngRedux.configureStore(rootReducer, INITIAL_STATE, [], [ applyMiddleware(logger) ]);
```

## Reducer middleware

Reducer middleware runs inside the reducer. Each one is handed the state and the action, and calls `next` to pass a
state, and optionally a different action, on to the one after it.

```ts
import type { Middleware } from '@angular-redux2/store';

const stamp: Middleware = (state, action, next) => {
    return next({ ...state, lastAction: action.type });
};

const audit: Middleware = (state, action, next) => {
    const nextState = next(state, action);
    console.log(action.type, state, nextState);

    return nextState;
};

ngRedux.configureStore(rootReducer, INITIAL_STATE, [ stamp, audit ]);
```

```ts
interface Middleware<S = any, A extends Action = AnyAction> {
    (state: S, action: A, next: NextMiddleware<A>): S;
}

interface NextMiddleware<A extends Action = AnyAction> {
    (state: any, action?: A): any;
}
```

The chain runs in array order, then routes [sub-store](/store/sub-store) actions, then calls the root reducer last.
`next` called without an action passes the original one on. Returning without calling `next` stops the chain, and the
state returned becomes the new state.

::: warning `Middleware` name clash
`redux` and `@angular-redux2/store` both export a type named `Middleware`, and they are different shapes. Import the
one you mean, or alias one of them: `import type { Middleware as ReducerMiddleware } from '@angular-redux2/store'`.
:::

Reducer middleware is set by `configureStore` only; [`provideStore`](/store/ng-redux#providestore) takes none.

## See also

- [NgRedux](/store/ng-redux#configurestore)
- [Draft state](/reducers/draft-state)
