# Getting Started

`@angular-redux2/store` connects a [Redux](https://redux.js.org/) store to an Angular application. `NgRedux` holds the
store and hands it out as RxJS observables, and a handful of decorators bind state to components.

## Install

::: code-group

```bash [npm]
npm install @angular-redux2/store@4 redux broadcast-channel
```

```bash [pnpm]
pnpm add @angular-redux2/store@4 redux broadcast-channel
```

```bash [yarn]
yarn add @angular-redux2/store@4 redux broadcast-channel
```

:::

The `v4.0.x` line declares Angular 12 and later, Redux 4.1 and later, and `broadcast-channel` 4.8 and later as peers.
`broadcast-channel` backs [tab sync](/advanced/sync).

## Configure the store

Import `NgReduxModule` and configure the store from a module the root module imports:

```ts
import { isDevMode, NgModule } from '@angular/core';
import { DevToolsExtension, NgRedux, NgReduxModule } from '@angular-redux2/store';
import { INITIAL_STATE, rootReducer } from './store';

import type { AppStateInterface } from './store';

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

The third argument takes Redux middleware, such as a logger; see [NgRedux](/store/ng-redux#configurestore).

## Read and write state

```ts
import { Component } from '@angular/core';
import { Dispatch, Select } from '@angular-redux2/store';

import type { Observable } from 'rxjs';

@Component({
    selector: 'app-counter',
    template: '<button (click)="increment()">Clicked {{ count$ | async }} times</button>'
})
export class CounterComponent {
    @Select() readonly count$: Observable<number>;

    @Dispatch
    increment() {
        return { type: 'INCREMENT' };
    }
}
```

`@Select()` with no argument selects the property named after the field, without its trailing `$`.

## Where to go next

- [NgRedux](/store/ng-redux) - configuring the store, `select`, and `dispatch`.
- [Decorators](/decorators/select) - `@Select`, `@Select$`, `@Dispatch`, and `@Substore`.
- [Class reducers](/reducers/class-reducers) - reducers written as classes.
- [Tab sync](/advanced/sync) - the same state in every open tab.
- [Mocks](/testing/mocks) - testing components that use the store.
