# @Select and @Select$

`@Select` and `@Select$` turn a property into a selection from the store. The property becomes a getter that returns an
`Observable`, so a template reads it with the `async` pipe.

## @Select

```ts
function Select<T>(selector?: Selector<any, T>, comparator?: Comparator): PropertyDecorator
```

```ts
import { Select } from '@angular-redux2/store';

export class UserComponent {
    @Select() readonly name$: Observable<string>;                        // state.name
    @Select('occupation') readonly job$: Observable<string>;             // state.occupation
    @Select([ 'address', 'city' ]) readonly city$: Observable<string>;   // state.address.city
    @Select(state => state.items.length) readonly count$: Observable<number>;
}
```

With no selector, the property name is used with a trailing `$` removed, so `name$` selects `name`. The `selector` and
`comparator` take the same forms as [`select`](/store/selectors).

## @Select$

```ts
function Select$<T>(selector: Selector<any, T>, transformer: Transformer<any, T>, comparator?: Comparator): PropertyDecorator
```

`@Select$` runs the selection through a transformer before handing it out. The transformer takes the observable, not
the value, so any RxJS pipeline fits:

```ts
import { debounceTime, map } from 'rxjs';
import { Select$ } from '@angular-redux2/store';

const debounceAndTriple = (value$: Observable<number>) => value$.pipe(
    debounceTime(300),
    map(value => value * 3)
);

export class FooComponent {
    @Select$([ 'foo', 'bar' ], debounceAndTriple)
    readonly fooBar$: Observable<number>;
}
```

The transformer also receives the decorated instance as its second argument. The `comparator` is applied to what the
transformer emits.

## How the selection is resolved

The selection is built the first time the property is read, then cached on the instance, so every read returns the same
observable. It comes from the store of the class: the [sub-store](/decorators/substore) when the class has `@Substore`
and a base path, otherwise [`NgRedux.store`](/store/ng-redux#static-access).

::: warning `useDefineForClassFields`
The decorator puts a getter on the prototype. With `useDefineForClassFields: true` the field declaration creates an
own property that hides it, and the property reads `undefined`. Angular projects set the option to `false`; keep it so,
or write the field as `declare readonly name$: Observable<string>`.
:::

::: info 🧪 Testing
A cached selection keeps the store it was built from. In tests, reset the [mocks](/testing/mocks) before creating the
component, not after.
:::

## See also

- [Selectors](/store/selectors)
- [@Dispatch](/decorators/dispatch)
- [@Substore](/decorators/substore)
