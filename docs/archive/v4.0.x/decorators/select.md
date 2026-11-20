# @Select and @Select$

`@Select` turns a property into an observable selection from the store, and `@Select$` runs that selection through a
transformer first.

```ts
import { map } from 'rxjs';
import { Select, Select$ } from '@angular-redux2/store';

const doubled = (value$: Observable<number>) => value$.pipe(map(value => value * 2));

export class CounterComponent {
    @Select() readonly counter$: Observable<number>;                       // state.counter
    @Select([ 'pathDemo', 'foo', 'bar' ]) readonly bar$: Observable<string>;
    @Select$('counter', doubled) readonly doubled$: Observable<number>;
}
```

| Decorator | Signature                                                           |
|-----------|---------------------------------------------------------------------|
| `Select`  | `Select<T>(selector?, comparator?): PropertyDecorator`              |
| `Select$` | `Select$<T>(selector, transformer, comparator?): PropertyDecorator` |

With no selector, the property name is used with a trailing `$` removed. The selection is built on first read and
cached on the instance; it comes from the class's [sub-store](/decorators/substore) when it has one, otherwise from
[`NgRedux.store`](/store/ng-redux#static-access).

## See also

- [Selectors](/store/selectors)
- [@Dispatch](/decorators/dispatch)
