# Sub-stores

A sub-store is a store rooted at a path of the state, with a reducer of its own. It has the same `state`, `select`,
`select$`, `dispatch`, `getState`, and `substore` as [`NgRedux`](/store/ng-redux), but all of them work on the branch
at its path. That makes it a fit for a component that edits one entry of a collection.

One difference: a sub-store's `dispatch` returns the action you passed in, not what a middleware returned, because the
root store receives a copy with the route added. A thunk is the exception, see
[Middleware](/store/middleware#thunks).

```ts
const bob = store.substore([ 'users', 'bob' ], userReducer);

bob.select(user => user.name)();             // state.users.bob.name
bob.dispatch({ type: 'ADD_LOC', payload: 100 });
bob.getState();                              // state.users.bob
```

## In a component

```ts
injectSubstore<SubState>(basePath: BasePathType, reducer: Reducer<SubState>): SubStoreInterface<SubState>
```

`injectSubstore` is the shorthand for `inject(NgRedux).substore(basePath, reducer)`, so call it in a field initializer
or a constructor. It destroys the sub-store when the component, or whatever injector created it, is destroyed. Pass a function as the path, and the sub-store follows
the signals that the function reads, such as a signal input:

```ts
import { Component, input } from '@angular/core';
import { injectSubstore } from '@angular-redux2/store';

@Component({
    selector: 'app-user',
    template: `
        <p>{{ name() }}: {{ loc() }} lines</p>
        <button (click)="addCode(100)">Add 100 lines</button>
    `
})
export class User {
    readonly userId = input.required<string>();

    private readonly user = injectSubstore(() => [ 'users', this.userId() ], userReducer);

    readonly name = this.user.select(user => user.name);
    readonly loc = this.user.select(user => user.loc);

    addCode(lines: number): void {
        this.user.dispatch({ type: 'ADD_LOC', payload: lines });
    }
}
```

When `userId` changes, `name` and `loc` move to the new user, and the next dispatch goes to the new path.

## How a dispatch is routed

A sub-store adds a route to each action it dispatches: the id of its reducer and its path at that moment. The root
reducer runs only the sub-store reducer on that branch and copies only the objects along the path. An action
dispatched on the root store never reaches a sub-store reducer, and a sub-store action never reaches the root reducer.

The route holds an id, not the reducer itself, so the action stays serializable and Redux DevTools can record and
replay it. Sub-stores that share a reducer, such as one per list item, share one id.

A sub-store reducer is a plain Redux reducer, so give it a default state. Wrap it in [`draft`](/reducers/draft-state)
to write it as a mutation:

```ts
import { draft } from '@angular-redux2/store';

export const userReducer = draft(EMPTY_USER, (state, action) => {
    if (action.type === 'ADD_LOC') state.loc += <number> action['payload'];
});
```

## Destroying a sub-store

The store keeps the reducer of every sub-store it routes to. `destroy()` releases a sub-store, and the store forgets its
reducer once no other sub-store uses it:

```ts
const bob = store.substore([ 'users', 'bob' ], userReducer);
// ...
bob.destroy();
```

`injectSubstore` does this for you. A sub-store made with `store.substore` should be destroyed by hand, above all one
made with an inline reducer such as `store.substore(path, (state = {}) => state)`, since each call creates a new
reducer. Calling `destroy` twice does nothing. Do not dispatch through a destroyed sub-store.

## Nesting

`substore` on a sub-store continues its path, and follows a move of either path:

```ts
const address = bob.substore([ 'address' ], addressReducer); // state.users.bob.address
```

## See also

- [NgRedux](/store/ng-redux#substore)
- [Draft state](/reducers/draft-state)
- [Mocks](/testing/mocks)
