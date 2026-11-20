# @Dispatch

`@Dispatch` dispatches whatever the decorated method returns, and returns it to the caller as well. A return value of
`false` skips the dispatch.

```ts
import { Dispatch } from '@angular-redux2/store';

export class TodoComponent {
    @Dispatch
    add(title: string) {
        return { type: 'ADD_TODO', payload: { title } };
    }
}
```

It is applied without parentheses, and works on arrow-function properties too. The action goes to the class's
[sub-store](/decorators/substore) when it has one, otherwise to [`NgRedux.store`](/store/ng-redux#static-access).

## See also

- [@Select](/decorators/select)
- [Class reducers](/reducers/class-reducers)
