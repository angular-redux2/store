# How to use `dispatch` method
The `dispatch` method is used to dispatch an action to the store instance.
An action is an object that describes the changes that need to be made to the state.
The dispatch function returns the dispatched action object.

Here's an example of how to use the `dispatch` method:
```typescript
import { Component } from '@angular/core';
import { NgRedux } from '@angular-redux2/store';
import { increment } from './actions';

interface AppState {
  count: number;
}

@Component({
  selector: 'app-root',
  template: `
    <h1>Count: {{ count$ | async }}</h1>
    <button (click)="onClick()">Increment</button>
  `,
})
export class AppComponent {
  count$ = this.ngRedux.select<number>('count');

  constructor(private ngRedux: NgRedux<AppState>) {}

  onClick() {
    this.ngRedux.dispatch(increment());
  }
}
```

In the example above, we have defined an action creator `increment()` that creates an action object with type `INCREMENT`.
When the `onClick()` method is called, it dispatches the `increment()` action object to the store using the `dispatch` method.

> The `dispatch` method takes an action object as a parameter and dispatches it to the store.
> If the store instance is not initialized, an error is thrown.

> By default, the dispatch method runs in the Angular zone to prevent unexpected behavior when dispatching from callbacks to 3rd-party.

```typescript
import { Component } from '@angular/core';
import { NgRedux } from '@angular-redux2/store';
import { increment } from './actions';

interface AppState {
  count: number;
}

@Component({
  selector: 'app-root',
  template: `
    <h1>Count: {{ count$ | async }}</h1>
    <button (click)="onClick()">Increment</button>
  `,
})
export class AppComponent {
  count$ = NgRedux.store.select<number>('count');

  constructor() {}

  onClick() {
      // using static access 
      NgRedux.store.dispatch(increment());
  }
}
```

# How to use `Dispatch` decorators
The `@Dispatch` decorator is used to automatically dispatch the return value of a decorated function to the Redux store using `ngRedux.dispatch()`.
Here is an example of how to use the decorator:
```typescript
import { Dispatch } from '@angular-redux2/store';

@Component({
  selector: 'my-component',
  template: '<button (click)="onClick()">Add Item</button>',
})
export class MyComponent {
  @Dispatch()
  onClick(): { type: 'ADD_ITEM', payload: any } {
    return { type: 'ADD_ITEM', payload: { name: 'New Item' } };
  }
}
```
In this example, the `onClick()` function is decorated with `@Dispatch()`.
Anytime the `onClick()` function is called (in response to a button click, for example), 
its return value will automatically be dispatched to the Redux store using `ngRedux.dispatch()`.

The `@Dispatch` decorator returns a new `PropertyDescriptor` object, which can be used to replace the original method with the new wrapped method.
If the original method is undefined (for example, if the decorated method is an arrow function or a bound method),
then the `@Dispatch` decorator will define a new getter/setter pair for the decorated method.

Note that the decorated method should return an object with a type property that corresponds to a known action `type` in your application.
The `payload` property can be any data that you want to pass along with the action.

> This decorator assumes that the component instance has an `ngRedux` property that refers to a valid `NgRedux` instance.
> If the component instance does not have an `ngRedux` property, an error will be thrown.

# How to use `Dispatch` with `Reducer-Class`

```typescript
export class MyReducer extends AbstractReducer {
    static override actions: ReducerActions<MyReducer>;
    // ...
}
```
> see reducer.md

```typescript
@Component({
  selector: 'my-component',
  template: '<button (click)="onClick()">Add Item</button>',
})
export class MyComponent {
    @Dispatch()
    onClick(): AnyAction {
        // { type: 'ADD_ITEM', payload: { name: 'New Item' } }
        return MyReducer.actions.addItem({ name: 'New Item' });
    }
}
```
This will dispatch actions to the store that correspond to the action functions defined in the actions property.
