# Class reducers

A class reducer is a class of `@Action` methods, one per action it handles. The library generates the action types and
the action creators, and turns the class into an ordinary Redux reducer.

```ts
import { AbstractReducer, Action } from '@angular-redux2/store';
import type { ReducerActions } from '@angular-redux2/store';

export interface BugInterface {
    name: string;
    assign?: string;
}

export class BugReducer extends AbstractReducer {
    static override actions: ReducerActions<BugReducer>;

    @Action
    addBug(state: Array<BugInterface>, bug: BugInterface) {
        state.push(bug);
    }

    @Action
    assign(state: Array<BugInterface>, payload: { name: string, assign: string }) {
        const bug = state.find(item => item.name === payload.name);

        if (bug) {
            bug.assign = payload.assign;
        }
    }
}

export const bugReducer = BugReducer.createReducer<Array<BugInterface>>([]);
```

`bugReducer` is a plain reducer: pass it to `configureStore`, to `combineReducers`, or to a [sub-store](/store/sub-store).

## Action methods

An `@Action` method is called with the current state and the action's `payload`. It may mutate the state, which is a
[draft](/reducers/draft-state), and return nothing, or return a new state. Returning `undefined` keeps the state.

An action that no method handles leaves the state as it was. The class-name prefix is stripped before the method is
looked up, so an action typed with the bare method name, such as `addBug`, also reaches it.

## Action creators

`@Action` registers a creator for each method on the class's static `actions`:

```ts
BugReducer.actions.addBug({ name: 'crash on save' });
// { type: 'BugReducer/addBug', payload: { name: 'crash on save' } }
```

The action type is the class name and the method name. Declaring `actions` as `ReducerActions<BugReducer>` types each
creator's argument as the method's second parameter, so the payload is checked and autocompleted. To type a single
creator by hand, use `ActionCreator<Payload>`:

```ts
static override actions: {
    addBug: ActionCreator<BugInterface>;
};
```

Dispatch the creators with [`@Dispatch`](/decorators/dispatch#with-class-reducers) or `ngRedux.dispatch`.

::: warning ⚠️ Falsy payloads
A creator leaves `payload` off the action when the argument is falsy, so `actions.setCount(0)` arrives with no
payload and the method sees `undefined`. Wrap such values in an object: `actions.setCount({ count: 0 })`.
:::

::: warning ⚠️ Action types come from the class name
The type is built from `constructor.name` at runtime. A minifier that renames classes changes the types, and two
reducer classes minified to the same name would answer each other's actions. Keep class names in production builds,
or do not match on the type strings elsewhere.
:::

## See also

- [Draft state](/reducers/draft-state)
- [@Dispatch](/decorators/dispatch)
- [Sub-stores](/store/sub-store)
