# Selectors

A selector says which part of the state an observable follows. `select`, `@Select`, and `@Select$` take the same forms.

| Form     | Type                          | Example                        |
|----------|-------------------------------|--------------------------------|
| Property | `string \| number \| symbol`  | `'counter'`                    |
| Path     | `Array<string \| number>`     | `[ 'pathDemo', 'foo', 'bar' ]` |
| Function | `(state: RootState) => State` | `state => state.counter * 2`   |
| None     | `undefined`                   | the whole state                |

A selection emits once on subscribe, then whenever its value changes by `===`.

## Comparator

```ts
type Comparator = (previous: any, next: any) => boolean;
```

The comparator is RxJS's `distinctUntilChanged` predicate: it returns `true` when two values count as the same, and the
selection then stays quiet.

## See also

- [NgRedux](/store/ng-redux#select-and-dispatch)
- [@Select](/decorators/select)
