# Selectors

A selector is a function that picks one value out of the state. `select`, `select$`, and `injectSelect` all take one.

```ts
const name = store.select(state => state.user.name);
const total = store.select(state => state.todos.length);
const done = store.select(state => state.todos.filter(todo => todo.done).length);
```

Only the function form exists. A string key or a path array cannot be typed, so `select('counter')` would return
`unknown`, while `select(state => state.counter)` returns `number`.

## Signal or observable

|                   | `select` / `injectSelect`  | `select$`                           |
|-------------------|----------------------------|-------------------------------------|
| Returns           | `Signal<T>`, a `computed`  | `Observable<T>`                     |
| In a template     | `count()`                  | `count$ \| async`                   |
| Runs the selector | when read after a change   | after every dispatch                |
| Emits             | the latest value when read | every distinct value, synchronously |
| Cleanup           | none                       | unsubscribe                         |

Use the signal by default. Use `select$` for RxJS pipelines, such as a debounced search, that must react to each value
in order.

## When a selection updates

A selection compares the new value with the previous one using `Object.is`, and `select$` using `===`. The two differ
only for `NaN` and `-0`. Selecting a primitive, or an object that
the reducer did not replace, stays quiet across unrelated actions.

::: warning 🔁 New objects on every call
A selector that builds a new object or array, such as `state => state.todos.filter(...)`, returns a value that is never
equal to the last one, so readers update after every action. Pass `equal`, or select the pieces separately.
:::

## equal

```ts
const ids = store.select(state => state.todos.map(todo => todo.id), {
    equal: (previous, next) => previous.length === next.length && previous.every((id, index) => id === next[index])
});
```

`equal` returns `true` when two values count as the same, and the selection then keeps the previous value. The signal
form takes Angular's whole `computed` options, so `debugName` works too.

## See also

- [NgRedux](/store/ng-redux#select)
- [Sub-stores](/store/sub-store)
