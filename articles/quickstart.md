## Installation

`@angular-redux2/store` has a peer dependency on redux, so we need to install it as well.

```sh
npm install --save redux @angular-redux2/store
```

## Quick Start

`store/store.module.ts` 

Import the `NgReduxModule` class and add it to your application module as an `import`. Once you've done this, you'll be able to inject `NgRedux` into your Angular components. In your top-level app module, you can configure your Redux store with reducers, initial state, and optionally middlewares and enhancers as you would in Redux directly.

```typescript
/**
 * Imports
 */

import { CommonModule } from '@angular/common';
import { isDevMode, NgModule } from '@angular/core';

/**
 * Imports actions
 */

import { IAppState, INITIAL_STATE, rootReducer } from './state';
import { DevToolsExtension, NgRedux, NgReduxModule } from "@angular-redux2/store";


/**
 * Redux store module
 */


@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        NgReduxModule
    ]
})
export class StoreModule {

    /**
     * Constructor
     */

    constructor(ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension) {
        let enhancer: Array<any> = [];

        if (devTools.enhancer() && isDevMode())
            enhancer = [ devTools.enhancer() ];

        ngRedux.configureStore(<any> rootReducer, INITIAL_STATE, [], enhancer);
    }
}
```

Or if you prefer to create the Redux store yourself you can do that and use the `provideStore()` function instead:

```typescript
/**
 * Imports
 */

import { createLogger } from 'redux-logger';
import { CommonModule } from '@angular/common';
import { isDevMode, NgModule } from '@angular/core';
import { applyMiddleware, createStore, Store } from "redux";

/**
 * Imports actions
 */

import { IAppState, rootReducer } from './state';
import { NgRedux, NgReduxModule } from "@angular-redux2/store";

/**
 * Redux store
 */

export const store: Store<IAppState> = createStore(
    rootReducer,
    applyMiddleware(createLogger()),
);

/**
 * Redux store module
 */

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        NgReduxModule
    ]
})
export class StoreModule {

    /**
     * Constructor
     */

    constructor(ngRedux: NgRedux<IAppState>) {
        ngRedux.provideStore(store);
    }
}
```

> Note that we're also using a Redux middleware from the community here: [redux-logger](https://www.npmjs.com/package/redux-logger). This is just to show off that `@angular-redux/store` is indeed compatible with Redux middleware as you might expect.
>
> Note that to use it, you'll need to install it with `npm install --save redux-logger` and type definitions for it with `npm install --save-dev @types/redux-logger`.

Now your Angular app has been reduxified! Use the `@Select` decorator to access your store state, and `.dispatch()` to dispatch actions:

```typescript
import { Select } from '@angular-redux2/store';

@Component({
  template:
    '<button (click)="onClick()">Clicked {{ count | async }} times</button>',
})
class App {
  @Select() count$: Observable<number>;

  constructor(private ngRedux: NgRedux<IAppState>) {
      
  }

  onClick() {
    this.ngRedux.dispatch({ type: INCREMENT });
  }
}
```