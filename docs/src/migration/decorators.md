# Migrating from 5.x

Version 6 rebuilds the store on Angular signals and moves the decorators out of the core package. This page explains
why, shows the signal API that replaces them, and shows how to keep the decorators while you migrate.

## Why the decorators left the core

The 5.x decorators worked, but they cost every application more than they saved.

- **A setting most projects do not have.** `@Select` puts a getter on the prototype. A new Angular project targets
  ES2022, where `useDefineForClassFields` defaults to `true`, and then the class field hides that getter. Every
  `@Select` property silently reads `undefined`, with no error. The 5.x docs had to repeat this warning in three
  places, which shows how often it caught people.
- **A global store.** A decorator runs outside Angular's injection context, so it cannot call `inject`. The store had
  to register itself as a static `NgRedux.store`, which every decorated member read. Two applications on one page, or
  two server-side renders at once, shared that one store.
- **No type safety.** In `@Select('counter') count$: Observable<number>`, nothing checks that `counter` holds a
  number, and the field needs a `!` or a `declare`. A function selector in `injectSelect` is checked and inferred.
- **Out of step with Angular.** Angular replaced `@Input`, `@Output`, and constructor injection with `input()`,
  `output()`, and `inject()`. A store API built on property decorators reads like the old style.

Dropping them removed the static store, the per-instance selection caches, and the decorator metadata, and nothing in
version 6 needs a `tsconfig.json` setting.

## Why signals

The state of the store is a signal, and every selection is a `computed` over it.

- A template calls `count()` without an `async` pipe, and a zoneless application updates without extra wiring.
- A selection needs no subscription, so there is nothing to clean up when a component is destroyed.
- A selection runs its selector only when something reads it after a change.
- `select$` stays for RxJS pipelines. It emits every change synchronously, which `toObservable` does not.

## From decorators to signals

::: code-group

```ts [5.x with decorators]
import { Dispatch, Select, Substore } from '@angular-redux2/store';

@Component({ template: '{{ count$ | async }}' })
export class Counter {
    @Select('counter') readonly count$!: Observable<number>;

    @Dispatch
    increment() {
        return { type: 'INCREMENT' };
    }
}

@Component({ template: '{{ loc$ | async }}' })
@Substore(userReducer)
export class User {
    @Input() userId!: string;
    @Select('loc') readonly loc$!: Observable<number>;

    basePath = () => [ 'users', this.userId ];

    @Dispatch
    addCode(lines: number) {
        return { type: 'ADD_LOC', payload: lines };
    }
}
```

```ts [6.x with signals]
import { Component, inject, input } from '@angular/core';
import { injectSelect, injectSubstore, NgRedux } from '@angular-redux2/store';

@Component({ template: '{{ count() }}' })
export class Counter {
    private readonly store = inject(NgRedux<AppState>);
    readonly count = injectSelect((state: AppState) => state.counter);

    increment(): void {
        this.store.dispatch({ type: 'INCREMENT' });
    }
}

@Component({ template: '{{ loc() }}' })
export class User {
    readonly userId = input.required<string>();

    private readonly user = injectSubstore(() => [ 'users', this.userId() ], userReducer);
    readonly loc = this.user.select(user => user.loc);

    addCode(lines: number): void {
        this.user.dispatch({ type: 'ADD_LOC', payload: lines });
    }
}
```

:::

| 5.x                                        | 6.x                                                        |
|--------------------------------------------|------------------------------------------------------------|
| `@Select('counter') count$`                | `count = injectSelect((state: AppState) => state.counter)` |
| `@Select$(selector, transformer)`          | `store.select$(selector).pipe(...)`                        |
| `@Dispatch` method                         | `inject(NgRedux).dispatch(action)`                         |
| `@Substore(reducer)` with `basePath`       | `injectSubstore(() => path, reducer)`                      |
| `ngRedux.configureSubStore(path, reducer)` | `store.substore(path, reducer)`                            |
| `select('key')` or `select([ 'a', 'b' ])`  | `select(state => state.a.b)`                               |
| `ngRedux.select(...)` (an `Observable`)    | `store.select$(...)`, or `store.select(...)` for a signal  |
| `select(selector, comparator)`             | `select(selector, { equal: comparator })`                  |
| `ngRedux.subscribe(listener)`              | `select$`, an `effect`, or `store.redux.subscribe`         |
| `ngRedux.replaceReducer(reducer)`          | `addReducer(key, reducer)` or `provideNgReduxFeature`      |
| `from(ngRedux)`                            | `store.select$(state => state)`                            |
| `NgRedux.store`                            | `inject(NgRedux)`                                          |
| `configureStore(...)` or `NgReduxModule`   | `provideNgRedux({ ... })`                                  |

## Keep the decorators with @angular-redux2/decorators

To migrate one component at a time, add `@angular-redux2/decorators`. It brings back the 5.x `@Select`, `@Select$`,
`@Dispatch`, and `@Substore` on top of the version 6 store, so existing components keep working while new ones use
signals.

::: code-group

```bash [npm]
npm install @angular-redux2/decorators
```

```bash [pnpm]
pnpm add @angular-redux2/decorators
```

:::

Add its provider next to `provideNgRedux`. A decorator runs outside Angular's injection context, so it cannot inject
the store, and the provider hands the store over when the application starts:

```ts
import { provideNgRedux } from '@angular-redux2/store';
import { provideNgReduxDecorators } from '@angular-redux2/decorators';

export const appConfig: ApplicationConfig = {
    providers: [
        provideNgRedux({ reducer: rootReducer }),
        provideNgReduxDecorators()
    ]
};
```

In a test, add `provideNgReduxDecorators()` after `provideMockNgRedux`, and the decorators read the mock.

Then change the import, and the component stays as it was:

```ts
import type { Observable } from 'rxjs';

import { Component } from '@angular/core';
import { Dispatch, Select } from '@angular-redux2/decorators'; // [!code ++]
import { Dispatch, Select } from '@angular-redux2/store'; // [!code --]

@Component({
    selector: 'app-counter',
    template: `
        <p>{{ count$ | async }}</p>
        <button (click)="increment()">+1</button>
    `
})
export class Counter {
    @Select('counter') readonly count$!: Observable<number>;

    @Dispatch
    increment() {
        return { type: 'INCREMENT' };
    }
}
```

A decorated component and a signal component can sit next to each other and share one store:

```ts
@Component({ template: '{{ count$ | async }} / {{ doubled() }}' })
export class Mixed {
    @Select('counter') readonly count$!: Observable<number>;                    // old style
    readonly doubled = injectSelect((state: AppState) => state.counter * 2);    // new style
}
```

::: warning ⚙️ The decorators still need the setting
The decorators package works the way 5.x did, so it still needs `"useDefineForClassFields": false` in
`tsconfig.json`. Signal components do not. Once the last decorated component is migrated, remove the package and the
setting.
:::

## Other changes

### Class reducers

`AbstractReducer` and `@Action` are replaced by [`createSlice`](/reducers/slices), which needs no class and no separate
type declaration for its action creators:

::: code-group

```ts [5.x]
export class TodoReducer extends AbstractReducer {
    static override actions: ReducerActionsType<TodoReducer>;

    @Action
    add(state: Array<TodoInterface>, title: string) {
        state.push({ title, done: false });
    }
}

ngRedux.dispatch(TodoReducer.actions.add('Write docs'));
```

```ts [6.x]
export const todos = createSlice('todos', <Array<TodoInterface>> [], {
    add(state, title: string) {
        state.push({ title, done: false });
    }
});

store.dispatch(todos.actions.add('Write docs'));
```

:::

The action types change from `TodoReducer/add` to `todos/add`. Update any code that matches the type string.

### Draft state is opt-in

In 5.x every reducer received a draft. In 6.x a plain reducer is a plain Redux reducer and must return a new state.
Wrap a reducer that mutates in [`draft`](/reducers/draft-state), or move it into a slice. Turn on `freeze: isDevMode()`
to find the reducers that still mutate, since they now throw.

### Middleware

The `middleware` option now takes Redux middleware. The 5.x reducer middleware is gone. See
[Middleware](/store/middleware).

### Mocks

`MockNgReduxModule` and the selector stubs are replaced by [`provideMockNgRedux`](/testing/mocks). Set the state with
`setState` or `patchState` instead of pushing into a stub, and read `dispatched` instead of spying on `dispatch`.

## See also

- [Getting Started](/guide)
- [Selectors](/store/selectors)
- [Sub-stores](/store/sub-store)
- [Release Notes](/release)
