# Getting Started

`@angular-redux2/store` connects a [Redux](https://redux.js.org/) store to an Angular application. `NgRedux` holds the
store and hands it out as RxJS observables, and a handful of decorators bind state to components without wiring
subscriptions by hand.

## Install

::: code-group

```bash [npm]
npm install @angular-redux2/store@5 redux
```

```bash [pnpm]
pnpm add @angular-redux2/store@5 redux
```

```bash [yarn]
yarn add @angular-redux2/store@5 redux
```

:::

The `v5.0.x` line declares Angular 12 and later, RxJS 7.5 and later, and Redux 4.2.1 and later as peers, and was built
and tested with Angular 15.

## Describe the state

```ts
/**
 * Imports
 */

import { combineReducers } from 'redux';

/**
 * State
 */

export interface AppStateInterface {
    counter: number;
}

export const INITIAL_STATE: AppStateInterface = {
    counter: 0
};

export const rootReducer = combineReducers({
    counter: (state: number = 0, action: { type: string }) => action.type === 'INCREMENT' ? state + 1 : state
});
```

## Configure the store

Configure the store once, before the first component reads from it. A store module that the root module imports is the
place:

```ts
/**
 * Imports
 */

import { isDevMode, NgModule } from '@angular/core';
import { DevToolsExtension, NgRedux, NgReduxModule } from '@angular-redux2/store';
import { INITIAL_STATE, rootReducer } from './store';

/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { AppStateInterface } from './store';

/**
 * Store module
 */

@NgModule({
    imports: [ NgReduxModule ]
})
export class StoreModule {
    constructor(ngRedux: NgRedux<AppStateInterface>, devTools: DevToolsExtension) {
        const enhancers = isDevMode() && devTools.isEnabled() ? [ devTools.enhancer() ] : [];

        ngRedux.configureStore(rootReducer, INITIAL_STATE, [], enhancers);
    }
}
```

`NgReduxModule` provides [`DevToolsExtension`](/store/devtools). `NgRedux` itself is provided in root.

## Read and write state

```ts
/**
 * Imports
 */

import { Component } from '@angular/core';
import { Dispatch, Select } from '@angular-redux2/store';

/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Observable } from 'rxjs';

/**
 * Component
 */

@Component({
    selector: 'app-counter',
    template: `
        <p>{{ counter$ | async }}</p>
        <button (click)="increment()">+1</button>
    `
})
export class CounterComponent {
    @Select() readonly counter$: Observable<number>;

    @Dispatch
    increment() {
        return { type: 'INCREMENT' };
    }
}
```

`@Select()` with no argument selects the property named after the field, without its trailing `$`. `@Dispatch` sends
what the method returns. Both reach the store through `NgRedux.store`, so the component injects nothing; it could as
well inject `NgRedux` and call `select('counter')` and `dispatch(...)` itself.

## Where to go next

- [NgRedux](/store/ng-redux) - configuring the store, `select`, `dispatch`, and the static accessor.
- [Selectors](/store/selectors) - property, path, and function selectors, and comparators.
- [Decorators](/decorators/select) - `@Select`, `@Select$`, `@Dispatch`, and `@Substore`.
- [Class reducers](/reducers/class-reducers) - reducers written as classes with typed action creators.
- [Draft state](/reducers/draft-state) - mutating state inside a reducer.
- [Mocks](/testing/mocks) - testing components that use the store.
