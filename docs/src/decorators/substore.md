# @Substore

`@Substore` scopes a class to a [sub-store](/store/sub-store). Its `@Select` and `@Dispatch` members then work relative
to a path the instance chooses, with the reducer given to the decorator.

```ts
import { Component, input } from '@angular/core';
import { Dispatch, Select, Substore } from '@angular-redux2/store';

@Component({
    selector: 'app-user',
    template: `
        <p>{{ name$ | async }}: {{ loc$ | async }} lines</p>
        <button (click)="addCode(100)">Add 100 lines</button>
    `
})
@Substore(userReducer)
export class UserComponent {
    readonly userId = input.required<string>();

    @Select('name') readonly name$: Observable<string>;     // users[userId].name
    @Select('loc') readonly loc$: Observable<number>;       // users[userId].loc

    basePath = (): PathSelectorType | null => [ 'users', this.userId() ];

    @Dispatch
    addCode(lines: number) {
        return { type: 'ADD_LOC', payload: lines };
    }
}
```

```ts
function Substore(reducer: Reducer<any, UnknownAction>): ClassDecorator
```

## basePath

The class declares a `basePath` returning the path its state lives at. It is read each time a decorated member needs
the store, and the sub-store is rebuilt when the path changes, so it may depend on inputs.

::: warning An arrow function, not a method
`basePath` is called without its instance, so a method that reads `this` throws. Declare it as an arrow-function
field, as above.
:::

While `basePath` returns `null` or `undefined`, or when the class has none, the members fall back to the
root [`NgRedux.store`](/store/ng-redux#static-access).

::: info Order
`@Substore` can sit above or below `@Component` or `@Injectable`.
:::

## See also

- [Sub-stores](/store/sub-store)
- [@Select](/decorators/select)
- [@Dispatch](/decorators/dispatch)
