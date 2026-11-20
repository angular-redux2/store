# @Dispatch

`@Dispatch` dispatches whatever the decorated method returns. The method is still called normally and its return value
still reaches the caller.

```ts
import { Dispatch } from '@angular-redux2/store';

export class TodoComponent {
    @Dispatch
    add(title: string) {
        return { type: 'ADD_TODO', payload: { title } };
    }
}
```

It is applied without parentheses: `@Dispatch`, not `@Dispatch()`.

## What gets dispatched

| Return value  | Effect                                                     |
|---------------|------------------------------------------------------------|
| An action     | Dispatched.                                                |
| `false`       | Nothing is dispatched.                                     |
| Anything else | Passed to `dispatch` as is; `undefined` makes Redux throw. |

Returning `false` is the way to skip a dispatch conditionally:

```ts
@Dispatch
save(form: FormValueInterface) {
    return form.valid ? { type: 'SAVE', payload: form.value } : false;
}
```

The action goes to the store of the class: the [sub-store](/decorators/substore) when the class has `@Substore` and a
base path, otherwise [`NgRedux.store`](/store/ng-redux#static-access).

## Arrow-function properties

`@Dispatch` also works on a property holding a function:

```ts
export class TodoComponent {
    @Dispatch remove = (id: number) => ({ type: 'REMOVE_TODO', payload: id });
}
```

## With class reducers

A [class reducer](/reducers/class-reducers) exposes typed action creators, which make a natural return value:

```ts
@Dispatch
addBug(bug: BugInterface) {
    return BugReducer.actions.addBug(bug);
}
```

## See also

- [Class reducers](/reducers/class-reducers)
- [@Select](/decorators/select)
- [NgRedux](/store/ng-redux#dispatch)
