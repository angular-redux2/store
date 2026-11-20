# Draft state

Every reducer the store runs, the root reducer and each [sub-store](/store/sub-store) and
[class reducer](/reducers/class-reducers), is handed a draft of the state rather than the state itself. The reducer may
write to the draft as if it were mutable, and the store turns the writes into a new state.

```ts
function todosReducer(state: Array<TodoInterface>, action: PayloadActionInterface<TodoInterface>) {
    if (action.type === 'ADD_TODO') {
        state.push(action.payload!);
    }

    return state;
}
```

## What the reducer may do

| The reducer                                  | The new state                       |
|----------------------------------------------|-------------------------------------|
| writes to the draft                          | a copy with the writes applied      |
| returns a new value other than `null`        | that value                          |
| only reads, and returns the draft or nothing | the previous state, the same object |

Both styles below give the same result:

```ts
state.user.name = action.payload;                                   // mutate the draft
return { ...state, user: { ...state.user, name: action.payload } }; // or return a copy
```

## Structural sharing

Only the objects on the path to a write are copied. A write to `state.users[3].name` copies the root, `users`, and
`users[3]`; every other branch keeps its identity. [Selections](/store/selectors) compare with `===`, so the ones
watching untouched branches stay quiet.

::: info Plain objects and arrays
Only plain objects and arrays are drafted. `null`, a `Date`, a `Map`, a `Set`, or a class instance reaches the reducer
as it is, so replace such a value rather than mutating it.
:::

## See also

- [Class reducers](/reducers/class-reducers)
- [Selectors](/store/selectors#when-a-selection-emits)
- [Middleware](/store/middleware)
