# How to create reducer
A reducer is a function that describes how an application's state should be changed in response to an action.
In Redux, reducers are pure functions that take in the current state and an action as arguments, and return the new state.

In the context of `@angular-redux2/store`,
a reducer is typically a class that extends the AbstractReducer class and defines a set of methods,
each corresponding to a specific action that can be dispatched.
These methods should be decorated with the Action decorator,
which takes care of generating the action object when the method is called.

Here's an example of a `@angular-redux2/store` reducer class:
```typescript
import { Action, AbstractReducer } from '@angular-redux2/store';

export interface Bug {
    name: string;
    active?: boolean;
    assign?: string;
}

export class BugReducer extends AbstractReducer {
    
    //Auto generate type information for autocompletion of action creators in your reducer that inherit from `AbstractReducer`
    static override actions: ReducerActions<BugReducer>;
    
    // or 
    static override actions: {
        addBug: ActionCreator<Bug>
    };
    
    @Action
    addBug(state: Array<Bug>, payload: Bug) {
        state.push(payload);
    }
}

export const counterReducer = BugReducer.createReducer<Bug[]>([]);

```
In this example, `BugReducer` extends `AbstractReducer` and defines one method decorated with
`@Action`: addBug. These methods take in the current state and an action, and return a new state array with the add bug object.

The `BugReducer` method of the `AbstractReducer` class is then called to create a Redux reducer function that can be used with `createStore`. 
It takes in the initial state object as an argument and returns a reducer function that can handle the actions defined in the CounterReducer class.

> In the `AbstractReducer` class, the action function extracts the `payload` property from the `action` object that is passed in as an argument.
> This is done using the bracket notation (`action['payload']`) to access the payload property of the action object.
> The payload property is used to update the state of the application.

```typescript
@Dispatch
addBug(bug: Bug) {
    return BugReducer.actions.addBug({ name: 'new bug', active: true, assign: 'Jo' });
}
```

In this example, the `@Dispatch` decorator is used on the `addBug` method.
The `addBug` method returns an action created by the `addBug` action creator defined in the `BugReducer` class using the `BugReducer.actions.addBug` syntax.
By using this `decorator`, the action created by the `addBug` method is automatically dispatched to the Redux store without the need to manually dispatch it in the component that uses this method.

Using either `ActionCreator<Bug>` or `ReducerActions<BugReducer>` types allows your IDE to provide auto-complete suggestions for the payload object.
These types define the structure of the action object, including its payload property.
The IDE can then use this information to suggest appropriate fields and values for the payload object.

## Redux reducer
You can still use the old way of writing reducers as a function that takes the current state and an action as arguments and returns the new state.
Here's an example of how you can write the authReducer using the old way:

```typescript
import { AnyAction } from 'redux';

export interface AuthState {
    isLoggedIn: boolean;
}

export const initialState: AuthState = {
    isLoggedIn: false,
};

export function authReducer(state = initialState, action: AnyAction): AuthState {
    switch (action.type) {
        case 'IS_LOGIN':
            state.isLoggedIn = !state.isLoggedIn
    }
}
```

```typescript
@Dispatch
addBug(bug: Bug) {
    return { type: 'IS_LOGIN' };
}
```

## Draft state
The "Draft State" pattern is a technique used in Angular-Redux2 to optimize state
updates by copying only the changed parts of the state object instead of copying the entire object.

Normally, when a state is updated in a reducer function,
the entire state object is copied and modified to create a new state object.
This can be inefficient when dealing with large or deeply nested
state objects since it involves creating and copying a lot of objects.

The "Draft State" pattern provides a more efficient approach by using a special "draft" object.
This object is created as a copy of the current state object and is modified in place with the new state changes.

Here are some examples of how to use the Draft State pattern in a reducer function:
```typescript
export function anyReducer(state = initialState, action: AnyAction): AuthState {
    state.user.push(action.user); // modifying the state object in place
}
```

```typescript
export function anyReducer(state = initialState, action: AnyAction): AuthState {
    return {
        ...state, // copying the entire state object
        name: 'x' // adding a new property
    }
}
```

```typescript
export function anyReducer(state = initialState, action: AnyAction): AuthState {
    return 'test'; // returning new state
}
```

