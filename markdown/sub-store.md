# How to use sub-sore
SubStore in Angular-Redux2 allows you to carve off a sub-store from a parent store.
This sub-store has its own base path and local reducer.
The returned object is an observable store that is specific to that sub-store and will not know about the parent store.

A sub-store is mainly used to provide extra flexibility when working with an array of objects.
It allows you to create a separate store with its own reducer function, which can be accessed through the main store using a specified path.
This can be useful for managing specific portions of your state tree or breaking down a large state into smaller, more manageable pieces.

> A sub-store provides the same set of functionalities as the main Redux store, such as `dispatch` and `select`.
> However, it is rooted at a specific path in your global state.
> This allows you to access and modify a subset of the global state, enabling more granular control and flexibility over your application state management.

```typescript
function subReducer(state: any, action: any): any {
    // ...
}

@Component({
    selector: 'my-component',
    template: `...`
})
export class MyComponent {
    private subStore: SubStoreService<State>;

    constructor(private ngRedux: NgRedux<State>) {
        this.subStore = new this.ngRedux.configureSubStore(['subStore'], subReducer);
    }

    ngOnInit() {
        // subscribe to the sub-store state changes
        this.subStore.subscribe(() => {
            // do something
        });

        // Use the dispatch method to dispatch an action to the sub-store:
        this.subStore.dispatch({
            type: 'INCREMENT'
        });
        
        // Use the select method to get the current state of the sub-store:
        const subStoreState = this.subStore.select();
    }

    ngOnDestroy() {
        // unsubscribe from the sub-store state changes
        this.subStore.unsubscribe();
        
        // To configure a sub-store with a specified base path and local reducer, use the configureSubStore method:
        this.subSubStore = this.subStore.configureSubStore(['subSubStore'], subSubReducer);
    }
}
```

# How to use `Substore` decorators
Substore is a decorator function in the angular-redux2 library that allows you to create and operate on a substore with a given reducer.
A substore is a subset of the global store that is created using a specific reducer, and it allows you to isolate and manage specific parts of the state tree.

Here's an example of how to use the Substore decorator:

```json
{
  "users": {
    "bob": {
      "name": "Bob Smith",
      "occupation": "Programmer",
      "loc": 1023
    },
    "alice": {
      "name": "Alice Jones",
      "occupation": "DevOps Specialist",
      "loc": 2314
    }
  }
}
```

```typescript
import { Component, Input } from '@angular/core';
import { Substore, configureSubStore } from '@angular-redux2/store';

export const userComponentReducer = (state, action) => {
    // ...
}

@Component({
    selector: 'user',
    template: `
    <p>name: {{ name$ | async }}</p>
    <p>occupation: {{ occupation$ | async }}</p>
    <p>lines of code: {{ loc$ | async }}</p>
    <button (click)="addCode(100)">Add 100 lines of code</button>
  `,
})
@Substore(userComponentReducer)
export class UserComponent {
    @Input() userId: string;

    // These selections are now scoped to the portion of the store rooted
    // at ['users', userId];
    @Select('name') readonly name$: Observable<string>;
    @Select('name') readonly name$: Observable<string>;
    @Select('occupation') readonly occupation$: Observable<string>;

    @Select$('loc', defaultToZero)

    // The substore will be created from the return value of this function.
    // allow you dinamic change sub-store path
    basePath(): (string | number)[] | null {
        return this.userId ? ['users', this.userId] : null;
    }

    // These dispatches will be scoped to the substore as well, as if you
    // had called ngRedux.configureSubStore(...).dispatch(numLines).

    @Dispatch
    addCode(numLines: any) {
        // Dispatching from the sub-store ensures this component instance's
        // subStore only sees the 'ADD_LOC' action.
        return { type: 'ADD_LOC', payload: numLines };
    }
}
```
