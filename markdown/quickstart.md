# Quickstart guide for Angular-Redux2
Angular-Redux2 is a state management library for Angular applications that uses Redux as 
its underlying architecture. It provides an easy way to manage state in complex applications and 
allows for easy debugging and testing of state changes.

This quickstart guide will walk you through the basic steps of setting up Angular-Redux2 in your Angular application.

## Installation
To install Angular-Redux2, you can use npm or yarn:

```bash
npm install @angular-redux2/store redux
```

or 

```bash
yarn add @angular-redux2/store redux
```

Setup:

* Create `store.module.ts`

```typescript
import { CommonModule } from '@angular/common';
import { isDevMode, NgModule } from '@angular/core';
import { INITIAL_STATE, rootReducer } from "./state";
import { DevToolsExtension, NgRedux, NgReduxModule } from "@angular-redux2/store";

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        NgReduxModule
    ]
})
export class StoreModule {
    constructor(ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension) {
        let enhancer: Array<any> = [];

        if (devTools.enhancer() && isDevMode())
            enhancer = [devTools.enhancer()];
        
        // Setting the INITIAL_STATE is optional when using a class reducer.
        // Just pass enpty object the class reduse set the initial state.
        ngRedux.configureStore(rootReducer, INITIAL_STATE, [], enhancer);
    }
}
```

* Import the `StoreModule` in your `AppModule`:

```typescript
import { NgReduxModule } from '@angular-redux2/store';

@NgModule({
    imports: [
        StoreModule
    ]
})
export class AppModule {
}
```

* Create state store

```typescript
/**
 * Imports
 */

import { combineReducers, Reducer } from 'redux';

/**
 * Actions
 */

import { AUTH_INITIAL_STATE, authReducer, Auth } from "./actions/auth.action";
import { USERS_INITIAL_STATE, usersReducer, Users } from "./actions/users.action";

/**
 * IAppState interface
 */

export interface IAppState {
    auth: Auth,
    users: Users
}

/**
 * Init IAppState
 * Setting the initial state is optional when using a class reducer.
 * The class reduse set the initial state.
 */

export const INITIAL_STATE: IAppState = {
    auth: AUTH_INITIAL_STATE,
    users: USERS_INITIAL_STATE,
};

/**
 * Root reducer
 */

export const rootReducer: Reducer<IAppState> = combineReducers({
    auth: authReducer,
    users: usersReducer
});
```

* In your component, inject `NgRedux`:

```typescript
import { NgRedux } from '@angular-redux2/store';

export class AppComponent {
    constructor(private ngRedux: NgRedux<any>) {
    }
}
```

* You can now use the `select()` function to select data from the store:

```typescript
import { Observable } from 'rxjs';
import { select } from '@angular-redux2/store';
import { AppState } from './app.state';

export class AppComponent {
  title$: Observable<string>;

  constructor(private ngRedux: NgRedux<IAppState>) {
    this.auth$ = this.ngRedux.select(state => state.auth);
  }
}
```

* Finally, dispatch actions to update the store:
```typescript
import { NgRedux } from '@angular-redux2/store';
import { increment } from './counter.actions';

export class AppComponent {
    constructor(private ngRedux: NgRedux<any>) {
    }

    onLogin() {
        this.ngRedux.dispatch({ type: 'IS_LOGIN', isLogin: true });
    }
}
```

That's it! You should now be able to use Angular-Redux2 in your Angular application.

## Conclusion
Angular-Redux2 provides a powerful and flexible way to manage state in Angular applications.
By following this quickstart guide, you should now have a basic understanding of how to 
set up Angular-Redux2 in your application.
For more advanced usage, please refer to the documentation.
