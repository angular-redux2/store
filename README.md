# angular-redux2

[![Documentation](https://img.shields.io/badge/Documentation-764abc?logo=angular&logoColor=f5f5f5)](https://angular-redux2.github.io/store/)
[![npm version](https://img.shields.io/npm/v/@angular-redux2/store.svg)](https://www.npmjs.com/package/@angular-redux2/store)
[![downloads](https://img.shields.io/npm/dm/@angular-redux2/store?label=npm%20downloads)](https://www.npmjs.com/package/@angular-redux2/store)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![CI](https://github.com/angular-redux2/store/actions/workflows/ci.yml/badge.svg)](https://github.com/angular-redux2/store/actions/workflows/ci.yml)
[![Discord](https://img.shields.io/discord/1050521693795405874?logo=Discord&label=Discord)](https://discord.com/invite/7BnsAqst6W)
[![Ask DeepWiki](https://img.shields.io/badge/Ask-DeepWiki-blue)](https://deepwiki.com/angular-redux2/store)

`@angular-redux2/store` connects a [Redux](https://redux.js.org/) store to an Angular application. The state is an
Angular signal and every selection is a `computed`, so a component reads it without an `async` pipe, a subscription,
a decorator, or a `tsconfig.json` setting.

## Key Features

- **Signals built in**: `NgRedux` holds the state as an Angular signal, and `select` and `injectSelect` return
  `computed` selections that need no subscription. They work with `computed`, `effect`, `linkedSignal`, OnPush, and
  zoneless change detection.
- **Faster than 5.x**: a dispatch sets one signal, and a selector runs only when something reads it. In the
  [benchmarks](https://angular-redux2.github.io/store/v6.0.x/benchmarks), dispatches run ~500× faster than 5.0.2, and
  scenarios with 1,000 selections ~13-50× faster.
- **Observables when you need them**: `select$` emits every change synchronously, for RxJS pipelines.
- **Typed slices**: `createSlice` turns one handler per action into a reducer and typed action creators.
- **Draft state**: a slice handler or a `draft` reducer may mutate its state, and only the paths it changes are
  copied.
- **Sub-stores**: `injectSubstore` gives a component a store rooted at a path, which can follow a signal input.
- **Testing mocks**: `@angular-redux2/store/mocks` provides a store whose state the test sets and whose dispatches it
  records.

## Installation

```bash
npm install @angular-redux2/store redux
```

Requires Angular 20 or newer, RxJS 7.5 or newer, and Redux 5.

## Usage

### Describing the state

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

### Configuring the store

```ts
import { provideNgRedux } from '@angular-redux2/store';
import { rootReducer } from './store';
import { type ApplicationConfig, isDevMode } from '@angular/core';

export const appConfig: ApplicationConfig = {
    providers: [
        provideNgRedux({ reducer: rootReducer, devTools: isDevMode(), freeze: isDevMode() })
    ]
};
```

### Reading and writing state

```ts
import { Component, inject } from '@angular/core';
import { injectSelect, NgRedux } from '@angular-redux2/store';

@Component({
    selector: 'app-counter',
    template: '<button (click)="increment()">{{ count() }}</button>'
})
export class CounterComponent {
    private readonly store = inject(NgRedux<AppState>);

    readonly count = injectSelect((state: AppState) => state.counter);

    increment(): void {
        this.store.dispatch(counter.actions.increment());
    }
}
```

### Working on one branch

```ts
import { input } from '@angular/core';
import { injectSubstore } from '@angular-redux2/store';

export class UserComponent {
    readonly userId = input.required<string>();

    private readonly user = injectSubstore(() => [ 'users', this.userId() ], userReducer);
    readonly loc = this.user.select(user => user.loc);  // follows userId
}
```

## Performance

Version 6 against 5.0.2, on the same reducers and a state of 1,000 todos and 1,000 users:

| Scenario                                                  |     5.0.2 |     6.x |
|-----------------------------------------------------------|----------:|--------:|
| 1,000 dispatches, no selections                           |    287 ms | 0.56 ms |
| 1,000 selections, 100 dispatches, all read after each one |     54 ms |  4.0 ms |
| 1,000 selections, 100 dispatches, read every 10th         |     54 ms |  1.1 ms |

5.x ran every reducer on a proxy and then walked the whole state after each change. Version 6 runs a plain reducer,
sets one signal, and runs a selector only when something reads it. See [Benchmarks](https://angular-redux2.github.io/store/v6.0.x/benchmarks) for the method.

## Migrating from 5.x

Version 6 has no decorators. They needed `"useDefineForClassFields": false`, which new Angular projects do not set,
and without it every `@Select` silently read `undefined`. To keep `@Select`, `@Dispatch`, and `@Substore` while you
migrate one component at a time, add `@angular-redux2/decorators`:

```ts
import { Dispatch, Select } from '@angular-redux2/decorators'; // was '@angular-redux2/store'
```

See [Migrating from 5.x](https://angular-redux2.github.io/store/v6.0.x/migration/decorators) for the reasons and a
side-by-side guide, and [Design decisions](https://angular-redux2.github.io/store/v6.0.x/design) for everything else that was removed or left out.

## Documentation

Full guides and the complete API reference live at
**[angular-redux2.github.io/store](https://angular-redux2.github.io/store/)**.

## Contributing

Contributions are welcome!\
Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Links

[Documentation](https://angular-redux2.github.io/store/), [GitHub Repository](https://github.com/angular-redux2/store), [Issue Tracker](https://github.com/angular-redux2/store/issues), [npm Package](https://www.npmjs.com/package/@angular-redux2/store)

## License

This project is licensed under the Mozilla Public License 2.0 - see the [LICENSE](LICENSE) file for details.
