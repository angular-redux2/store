# Getting Started

`@angular-redux2/store` connects a [Redux](https://redux.js.org/) store to an Angular application. `NgRedux` holds the
store and hands it out as RxJS observables, and a handful of decorators bind state to components without wiring
subscriptions by hand.

## Install

::: code-group

```bash [npm]
npm install @angular-redux2/store redux
```

```bash [pnpm]
pnpm add @angular-redux2/store redux
```

```bash [yarn]
yarn add @angular-redux2/store redux
```

:::

`rxjs` and `@angular/core` are peer dependencies an Angular application already has.

::: warning One `tsconfig.json` setting
The decorators need `"useDefineForClassFields": false` in `compilerOptions`. A new Angular 22 project targets ES2022
and leaves the option at its default, `true`, under which every `@Select` property reads `undefined`. See
[@Select](/decorators/select#how-the-selection-is-resolved).
:::

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

Add `provideNgRedux` to the application config. It configures the store before the first component renders:

```ts
/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { ApplicationConfig } from '@angular/core';

/**
 * Imports
 */

import { isDevMode } from '@angular/core';
import { provideNgRedux } from '@angular-redux2/store';
import { INITIAL_STATE, rootReducer } from './store';

/**
 * Config
 */

export const appConfig: ApplicationConfig = {
    providers: [
        provideNgRedux({ reducer: rootReducer, initialState: INITIAL_STATE, devTools: isDevMode() })
    ]
};
```

| Option          | Notes                                                                                                        |
|-----------------|--------------------------------------------------------------------------------------------------------------|
| `reducer`       | The root reducer. It may mutate its state, see [Draft state](/reducers/draft-state).                         |
| `initialState`  | The state the store starts from.                                                                             |
| `middleware`    | [Reducer middleware](/store/middleware#reducer-middleware), run in order before the reducer.                 |
| `enhancers`     | Redux store enhancers, such as `applyMiddleware(...)`.                                                       |
| `devTools`      | `true` or extension options to connect [Redux DevTools](/store/devtools); off by default.                    |
| `freeze`        | `true` [freezes the state](/store/ng-redux#freezing-the-state); pass `isDevMode()`. Off by default.          |
| `transferState` | `true` carries the state from [server-side rendering](/store/ng-redux#server-side-rendering) to the browser. |

A lazy route adds its own reducer with [`provideNgReduxFeature`](/store/ng-redux#addreducer), so the root reducer
does not have to list every feature.

An application that bootstraps an `NgModule` can import `NgReduxModule` and call
[`configureStore`](/store/ng-redux#configurestore) from the constructor of its root module instead.

## Read and write state

```ts
/**
 * Imports
 */

import { AsyncPipe } from '@angular/common';
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
    imports: [ AsyncPipe ],
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

::: tip 📡 Signals
`injectSelect` returns the same selection as a signal, without decorators, and it works with any
`useDefineForClassFields` setting:

```ts
import { injectSelect } from '@angular-redux2/store';

export class CounterComponent {
    readonly counter = injectSelect<number>('counter'); // {{ counter() }} in the template
}
```

See [`selectSignal`](/store/ng-redux#selectsignal).
:::

## Where to go next

- [Example](/example) - a complete application with every feature, and a unit test.
- [NgRedux](/store/ng-redux) - configuring the store, `select`, `dispatch`, and the static accessor.
- [Selectors](/store/selectors) - property, path, and function selectors, and comparators.
- [Decorators](/decorators/select) - `@Select`, `@Select$`, `@Dispatch`, and `@Substore`.
- [Class reducers](/reducers/class-reducers) - reducers written as classes with typed action creators.
- [Draft state](/reducers/draft-state) - mutating state inside a reducer.
- [Mocks](/testing/mocks) - testing components that use the store.
