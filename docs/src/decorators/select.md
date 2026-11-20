# @Select, @Select$, and @SelectSignal

`@Select` and `@Select$` turn a property into a selection from the store. The property becomes a getter that returns an
`Observable`, so a template reads it with the `async` pipe. [`@SelectSignal`](#selectsignal) returns a signal
instead, which a template reads without a pipe or a subscription.

::: tip 📡 Without decorators
[`injectSelect`](/store/ng-redux#selectsignal) returns the selection as a signal from a field initializer, and needs no
`useDefineForClassFields` setting: `readonly name = injectSelect<string>('name')`.
:::

## @Select

```ts
function Select<T, RootState = unknown>(selector?: SelectorType<RootState, T>, comparator?: ComparatorType<T>): PropertyDecorator
```

```ts
import { Select } from '@angular-redux2/store';

export class UserComponent {
    @Select() readonly name$: Observable<string>;                        // state.name
    @Select('occupation') readonly job$: Observable<string>;             // state.occupation
    @Select([ 'address', 'city' ]) readonly city$: Observable<string>;   // state.address.city
    @Select((state: AppStateInterface) => state.items.length) readonly count$: Observable<number>;
}
```

With no selector, the property name is used with a trailing `$` removed, so `name$` selects `name`. The `selector` and
`comparator` take the same forms as [`select`](/store/selectors).

A function selector's state is `unknown` unless its parameter is typed, so annotate it, as `count$` does above.

## @Select$

```ts
function Select$<S, T = S, RootState = unknown>(
    selector: SelectorType<RootState, S>,
    transformer: TransformerType<S, T>,
    comparator?: ComparatorType<T>
): PropertyDecorator
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

## @SelectSignal

```ts
function SelectSignal<T, RootState = unknown>(selector?: SelectorType<RootState, T>, comparator?: ComparatorType<T>): PropertyDecorator
```

```ts
import { SelectSignal } from '@angular-redux2/store';

@Component({ template: '{{ name() }} lives in {{ city() }}' })
export class UserComponent {
    @SelectSignal() readonly name: Signal<string>;                          // state.name
    @SelectSignal([ 'address', 'city' ]) readonly city: Signal<string>;     // state.address.city
}
```

It is the signal form of `@Select`, built on [`selectSignal`](/store/ng-redux#selectsignal). With no selector, the
property name is used as it is, so `name` selects `name`. A `comparator` decides whether a new value is a change, and
the signal keeps its previous value while the comparator calls the new one equal.

## How the selection is resolved

The selection is built the first time the property is read, then cached on the instance, so every read returns the same
observable or signal. It comes from the store of the class: the [sub-store](/decorators/substore) when the class has `@Substore`
and a base path, otherwise [`NgRedux.store`](/store/ng-redux#static-access).

::: warning `useDefineForClassFields`
The decorator puts a getter on the prototype. With `useDefineForClassFields: true` the field declaration creates an
own property that hides it, and the property reads `undefined`. A new Angular 22 project targets ES2022 and does not set
the option, so add `"useDefineForClassFields": false` to `tsconfig.json`, write the field as
`@Select() declare readonly name$: Observable<string>`, which emits no field, or use `injectSelect` instead.
:::

::: info 🧪 Testing
A cached selection keeps the store it was built from. In tests, reset the [mocks](/testing/mocks) before creating the
component, not after.
:::

## See also

- [Selectors](/store/selectors)
- [@Dispatch](/decorators/dispatch)
- [@Substore](/decorators/substore)
