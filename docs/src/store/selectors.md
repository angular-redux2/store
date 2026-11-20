# Selectors

A selector says which part of the state an observable follows. `select`, `@Select`, and `@Select$` all take the same
three forms.

| Form     | Type                          | Example                       |
|----------|-------------------------------|-------------------------------|
| Property | `string \| number \| symbol`  | `'counter'`                   |
| Path     | `Array<string \| number>`     | `[ 'users', 0, 'name' ]`      |
| Function | `(state: RootState) => State` | `state => state.items.length` |
| None     | `undefined`                   | the whole state               |

```ts
const state = { name: 'John', address: { city: 'New York' }, tags: [ 'a', 'b' ] };

ngRedux.select('name');                       // 'John'
ngRedux.select([ 'address', 'city' ]);        // 'New York'
ngRedux.select([ 'tags', 1 ]);                // 'b'
ngRedux.select(state => state.tags.length);   // 2
```

A path that runs into a missing key yields `undefined` rather than throwing, so a selection may watch a branch that
does not exist yet.

::: warning Falsy property selectors
A property selector of `0` or `''` is read as no selector and selects the whole state. Use a path instead:
`[ 0 ]` or `[ '' ]`.
:::

## When a selection emits

A selection emits once on subscribe, then each time its value changes. The value is compared with `===` by default,
so selecting a primitive or an object the reducer did not replace stays quiet across unrelated actions.

::: warning 🔁 New objects on every call
A function selector that builds a new object or array, such as `state => ({ a: state.a, b: state.b })`, returns a
value that is never `===` to the last one, and so emits on every action. Select the pieces separately, or pass a
comparator.
:::

## Comparator

```ts
type ComparatorType<T = unknown> = (previous: T, next: T) => boolean;
```

The comparator is RxJS's `distinctUntilChanged` predicate: it returns `true` when two values count as **the same**, and
the selection then stays quiet. Return `false` to let the new value through.

```ts
const sameIds = (previous: Array<ItemInterface>, next: Array<ItemInterface>) =>
    previous.length === next.length && previous.every((item, index) => item.id === next[index].id);

ngRedux.select<Array<ItemInterface>>('items', sameIds);
```

## See also

- [NgRedux](/store/ng-redux#select)
- [@Select](/decorators/select)
