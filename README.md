# angular-redux2

[![Documentation](https://img.shields.io/badge/Documentation-764abc?logo=angular&logoColor=f5f5f5)](https://angular-redux2.github.io/store/)
[![npm version](https://img.shields.io/npm/v/@angular-redux2/store.svg)](https://www.npmjs.com/package/@angular-redux2/store)
[![downloads](https://img.shields.io/npm/dm/@angular-redux2/store?label=npm%20downloads)](https://www.npmjs.com/package/@angular-redux2/store)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![CI](https://github.com/angular-redux2/store/actions/workflows/ci.yml/badge.svg)](https://github.com/angular-redux2/store/actions/workflows/ci.yml)
[![Discord](https://img.shields.io/discord/1050521693795405874?logo=Discord&label=Discord)](https://discord.com/invite/7BnsAqst6W)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/angular-redux2/store)

`@angular-redux2/store` connects a [Redux](https://redux.js.org/) store to an Angular application. It exposes the
store as RxJS observables, binds state to components with decorators, and lets reducers mutate a draft of the state
while unchanged branches keep their identity.

## Key Features

- **Injectable store**: `NgRedux` is provided in root and hands out every selection as an `Observable` for the `async`
  pipe, or as a signal with `selectSignal` and `injectSelect`.
- **Decorators**: `@Select` and `@Select$` bind a slice of state to a property, and `@Dispatch` dispatches what a
  method returns.
- **Class reducers**: a class of `@Action` methods becomes a reducer, with typed action creators from
  `ReducerActionsType<T>` and a `namespace` that survives minification.
- **Draft state**: a reducer may mutate `state`; only the paths it writes are copied.
- **Sub-stores**: a store rooted at a path with its own reducer, from code or with `@Substore` on a component.
- **Testing mocks**: `@angular-redux2/store/mocks` swaps the store for one whose selections are subjects the test
  drives.

## Installation

```bash
npm install @angular-redux2/store redux
```

Requires Angular 20 or newer, RxJS 7.5 or newer, and Redux 5.

## Usage

### Configuring the store

```ts
import { isDevMode } from '@angular/core';
import { provideNgRedux } from '@angular-redux2/store';

export const appConfig: ApplicationConfig = {
    providers: [
        provideNgRedux({ reducer: rootReducer, initialState: INITIAL_STATE, devTools: isDevMode() })
    ]
};
```

### Reading and writing state

```ts
import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Dispatch, Select } from '@angular-redux2/store';

@Component({
    selector: 'app-counter',
    imports: [ AsyncPipe ],
    template: '<button (click)="increment()">{{ counter$ | async }}</button>'
})
export class CounterComponent {
    @Select() readonly counter$: Observable<number>;   // state.counter

    @Dispatch
    increment() {
        return { type: 'INCREMENT' };
    }
}
```

Without decorators, `injectSelect` returns the selection as a signal:

```ts
export class CounterComponent {
    readonly counter = injectSelect<number>('counter'); // {{ counter() }}
}
```

### Writing a class reducer

```ts
import { AbstractReducer, Action } from '@angular-redux2/store';
import type { ReducerActionsType } from '@angular-redux2/store';

export class TodoReducer extends AbstractReducer {
    static override actions: ReducerActionsType<TodoReducer>;

    @Action
    add(state: Array<TodoInterface>, todo: TodoInterface) {
        state.push(todo);
    }
}

export const todoReducer = TodoReducer.createReducer<Array<TodoInterface>>([]);

TodoReducer.actions.add({ title: 'Write docs' });   // { type: 'TodoReducer/add', payload: { ... } }
```

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
