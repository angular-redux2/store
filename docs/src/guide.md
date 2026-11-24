# Getting Started

`@angular-redux2/store` connects a [Redux](https://redux.js.org/) store to an Angular application. The state is an
Angular signal, so a component reads it like any other signal: no `async` pipe, no subscription, and no decorator.

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

`rxjs` and `@angular/core` are peer dependencies that an Angular application already has. No `tsconfig.json` setting
is needed.

Signals are built into the store: the state is an Angular signal, and every selection is a `computed`. See
[Signals](/store/signals) for using them with `computed`, `effect`, and `linkedSignal`.

::: info 🔁 Coming from 5.x
Version 6 has no decorators. To keep `@Select`, `@Dispatch`, and `@Substore` while you migrate, add
`@angular-redux2/decorators`. [Migrating from 5.x](/migration/decorators) explains why they moved and shows both
styles side by side.
:::

## Describe the state

A slice holds one part of the state, its reducer, and one typed action creator per handler:

```ts
import { combineReducers } from 'redux';
import { createSlice } from '@angular-redux2/store';

export const counter = createSlice('counter', 0, {
    increment: state => state + 1,
    add: (state, amount: number) => state + amount
});

export const rootReducer = combineReducers({ counter: counter.reducer });
export type AppState = ReturnType<typeof rootReducer>;
```

## Configure the store

Add `provideNgRedux` to the application config:

```ts
import type { ApplicationConfig } from '@angular/core';

import { isDevMode } from '@angular/core';
import { provideNgRedux } from '@angular-redux2/store';
import { rootReducer } from './store';

export const appConfig: ApplicationConfig = {
    providers: [
        provideNgRedux({ reducer: rootReducer, devTools: isDevMode(), freeze: isDevMode() })
    ]
};
```

| Option          | Notes                                                                                                        |
|-----------------|--------------------------------------------------------------------------------------------------------------|
| `reducer`       | The root reducer.                                                                                            |
| `initialState`  | The state that the store starts from. Leave it out when the reducers have defaults.                          |
| `middleware`    | Redux [middleware](/store/middleware), such as a thunk or a logger.                                          |
| `enhancers`     | Redux store enhancers, applied after the middleware.                                                         |
| `devTools`      | `true` or extension options to connect [Redux DevTools](/store/devtools).                                    |
| `freeze`        | `true` [freezes every state](/store/ng-redux#freezing-the-state), so a mutation throws. Pass `isDevMode()`.  |
| `transferState` | `true` carries the state from [server-side rendering](/store/ng-redux#server-side-rendering) to the browser. |

The store is created the first time something injects it, and it is ready at that moment.

## Read and write state

```ts
import { Component, inject } from '@angular/core';
import { injectSelect, NgRedux } from '@angular-redux2/store';
import { counter, type AppState } from './store';

@Component({
    selector: 'app-counter',
    template: `
        <p>{{ count() }}</p>
        <button (click)="increment()">+1</button>
    `
})
export class Counter {
    private readonly store = inject(NgRedux<AppState>);

    readonly count = injectSelect((state: AppState) => state.counter);

    increment(): void {
        this.store.dispatch(counter.actions.increment());
    }
}
```

`injectSelect` returns a read-only signal. Annotate the selector parameter with the state type, and TypeScript infers
the selected type. `dispatch` sends an action, and the signal holds the new value as soon as it returns.

## Where to go next

- [Example](/example) - a complete application with every feature and a unit test.
- [NgRedux](/store/ng-redux) - the store, `select`, `select$`, and the store options.
- [Signals](/store/signals) - selections with `computed`, `effect`, `linkedSignal`, and inputs.
- [Selectors](/store/selectors) - signals, observables, and when a selection updates.
- [Sub-stores](/store/sub-store) - a store scoped to one branch of the state.
- [Slices](/reducers/slices) - reducers with typed action creators.
- [Draft state](/reducers/draft-state) - mutating state inside a reducer.
- [Mocks](/testing/mocks) - testing components that use the store.
- [Migrating from 5.x](/migration/decorators) - from decorators to signals.
- [Design decisions](/design) - what was removed or left out, and why.
- [Benchmarks](/benchmarks) - version 6 against 5.0.2.
