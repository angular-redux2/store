# @Substore

`@Substore` scopes a class to a [sub-store](/store/sub-store): its `@Select`, `@Select$`, and `@Dispatch` members work
relative to the path the instance returns from `getBasePath()`.

```ts
import { Component, Input } from '@angular/core';
import { Dispatch, Select, Substore } from '@angular-redux2/store';

@Component({
    selector: 'app-user',
    template: '<p>{{ name$ | async }}</p><button (click)="addCode(100)">Add 100 lines</button>'
})
@Substore(userReducer)
export class UserComponent {
    @Input() userId: string;

    @Select('name') readonly name$: Observable<string>;

    getBasePath(): Array<string> | null {
        return this.userId ? [ 'users', this.userId ] : null;
    }

    @Dispatch
    addCode(lines: number) {
        return { type: 'ADD_LOC', payload: lines };
    }
}
```

`getBasePath()` is a method, called on the instance each time a decorated member needs the store. While it returns a
falsy path the members use the root store, and the sub-store and the cached selections are rebuilt when the path
changes.

## See also

- [Sub-stores](/store/sub-store)
- [@Select](/decorators/select)
