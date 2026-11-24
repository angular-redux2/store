# Draft state

`draft` wraps a reducer so it receives a copy of the state that it may mutate. The store turns the changes into a new
state and leaves the old one untouched. [Slices](/reducers/slices) use it for every handler.

```ts
import { draft } from '@angular-redux2/store';

export const todosReducer = draft(<Array<TodoInterface>> [], (state, action) => {
    if (action.type === 'ADD_TODO') state.push(<TodoInterface> action['payload']);
});
```

```ts
draft<State>(initialState: State, recipe: (state: State, action: Action) => State | void): Reducer<State>
```

::: info Opt-in
A plain reducer must return a new state, as in Redux. Only a reducer wrapped in `draft`, or a slice handler, may
mutate its state.
:::

## What the recipe may do

| The recipe                                        | The new state                       |
|---------------------------------------------------|-------------------------------------|
| changes the draft                                 | a copy with the changes applied     |
| returns a new value                               | that value                          |
| only reads, or sets values back to what they were | the previous state, the same object |

## Structural sharing

Only the objects on the path to a changed value are copied. A change to `state.users[3].name` copies the root, `users`,
and `users[3]`, and every other branch keeps its identity. [Selections](/store/selectors) compare by identity, so the
ones that watch untouched branches stay quiet.

A push onto a long array revisits only the keys that changed, not the whole array.

::: info Plain objects and arrays
Only plain objects and arrays are drafted. `null`, a `Date`, a `Map`, a `Set`, or a class instance reaches the recipe
as it is, so replace such a value instead of mutating it.
:::

## See also

- [Slices](/reducers/slices)
- [Selectors](/store/selectors#when-a-selection-updates)
- [Freezing the state](/store/ng-redux#freezing-the-state)
