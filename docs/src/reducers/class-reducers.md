# Class reducers

A class reducer is a class of `@Action` methods, one per action it handles. The library generates the action types and
the action creators, and turns the class into an ordinary Redux reducer.

```ts
import { AbstractReducer, Action } from '@angular-redux2/store';
import type { ReducerActionsType } from '@angular-redux2/store';

export interface BugInterface {
    name: string;
    assign?: string;
}

export class BugReducer extends AbstractReducer {
    static override actions: ReducerActionsType<BugReducer>;

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

An action that no `@Action` method handles leaves the state as it was. Only a type with the class's prefix reaches a
method, so a bare `addBug`, or the name of a method that is not decorated, does nothing.

## Action creators

`@Action` registers a creator for each method on the class's static `actions`:

```ts
BugReducer.actions.addBug({ name: 'crash on save' });
// { type: 'BugReducer/addBug', payload: { name: 'crash on save' } }
```

The action type is the namespace and the method name. Declaring `actions` as `ReducerActionsType<BugReducer>` types each
creator's argument as the method's second parameter, so the payload is checked and autocompleted. The argument is
required when the method needs a payload, and a method without one gets a creator that takes none. Each class has
creators of its own, so two reducers may both have a `reset` method. To type a single creator by hand, use
`ActionCreatorType<Payload>`:

```ts
static override actions: {
    addBug: ActionCreatorType<BugInterface>;
};
```

Dispatch the creators with [`@Dispatch`](/decorators/dispatch#with-class-reducers) or `ngRedux.dispatch`.

## Namespace

The prefix of the action types is the class's static `namespace`, or the class name when it is not set:

```ts
export class BugReducer extends AbstractReducer {
    static override namespace = 'bugs';
    static override actions: ReducerActionsType<BugReducer>;
}

BugReducer.actions.addBug(bug); // { type: 'bugs/addBug', payload: bug }
```

::: warning ⚠️ Set a namespace for production builds
Without one, the type comes from the class name at runtime. A minifier that renames classes changes the types, and two
reducer classes minified to the same name would answer each other's actions.
:::

## See also

- [Draft state](/reducers/draft-state)
- [@Dispatch](/decorators/dispatch)
- [Sub-stores](/store/sub-store)
