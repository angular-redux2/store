# Example

A small zoneless Angular application that uses most of the API: a plain reducer and a class reducer, reducer
middleware, Redux DevTools, signal and observable selections, sub-stores, and a unit test on the mock store. Each file
is complete, so the pieces can be copied into a new project as they are.

```text
src/app/
  app.config.ts          provideNgRedux
  app.ts                 the root component
  store/
    app-state.ts         the state, the root reducer, and a middleware
    todo.reducer.ts      a class reducer
    user.reducer.ts      a sub-store reducer
  counter/counter.ts     @Select, @Select$, injectSelect, @Dispatch
  todos/todos.ts         typed action creators
  user/user.ts           @Substore
  counter/counter.spec.ts
```

## The state

`app-state.ts` describes the state, combines the reducers, and adds a reducer middleware that records the last action:

```ts
/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Reducer } from 'redux';
import type { TodoInterface } from './todo.reducer';
import type { UserInterface } from './user.reducer';
import type { MiddlewareInterface, PayloadActionInterface } from '@angular-redux2/store';

/**
 * Imports
 */

import { combineReducers } from 'redux';
import { todoReducer } from './todo.reducer';

/**
 * State
 */

export interface AppStateInterface {
    counter: number;
    todos: Array<TodoInterface>;
    users: Record<string, UserInterface>;
    lastAction: string;
}

export const INITIAL_STATE: AppStateInterface = {
    counter: 0,
    todos: [],
    users: {
        bob: { name: 'Bob Smith', loc: 1023 },
        alice: { name: 'Alice Jones', loc: 2314 }
    },
    lastAction: ''
};

function counterReducer(state = 0, action: PayloadActionInterface<number>): number {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        case 'ADD':
            return state + (action.payload ?? 0);
        default:
            return state;
    }
}

export const rootReducer = <Reducer<AppStateInterface>> combineReducers({
    counter: counterReducer,
    todos: todoReducer,
    users: (state: Record<string, UserInterface> = INITIAL_STATE.users) => state,
    lastAction: (state = '') => state
});

export const stampLastAction: MiddlewareInterface<AppStateInterface> = (state, action, next) =>
    next({ ...state, lastAction: action.type });
```

`todo.reducer.ts` is a [class reducer](/reducers/class-reducers). Its methods mutate a
[draft](/reducers/draft-state), and the `namespace` keeps the action types stable in a minified build:

```ts
import type { ReducerActionsType } from '@angular-redux2/store';
import { AbstractReducer, Action } from '@angular-redux2/store';

export interface TodoInterface {
    title: string;
    done: boolean;
}

export class TodoReducer extends AbstractReducer {
    static override namespace = 'todos';
    static override actions: ReducerActionsType<TodoReducer>;

    @Action
    add(state: Array<TodoInterface>, title: string): void {
        state.push({ title, done: false });
    }

    @Action
    toggle(state: Array<TodoInterface>, index: number): void {
        state[index].done = !state[index].done;
    }
}

export const todoReducer = TodoReducer.createReducer<Array<TodoInterface>>([]);
```

`user.reducer.ts` is the local reducer of a [sub-store](/store/sub-store). It only sees the user at the sub-store's
base path:

```ts
import type { PayloadActionInterface } from '@angular-redux2/store';

export interface UserInterface {
    name: string;
    loc: number;
}

export function userReducer(state: UserInterface = { name: '', loc: 0 }, action: PayloadActionInterface<number>): UserInterface {
    if (action.type === 'ADD_LOC') {
        state.loc += action.payload ?? 0;
    }

    return state;
}
```

## Configure the store

`app.config.ts` creates the store before the first component renders, and connects
[Redux DevTools](/store/devtools) in development:

```ts
import type { ApplicationConfig } from '@angular/core';
import { provideNgRedux } from '@angular-redux2/store';
import { isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { INITIAL_STATE, rootReducer, stampLastAction } from './store/app-state';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(), // the default from Angular 21 on
        provideNgRedux({
            reducer: rootReducer,
            initialState: INITIAL_STATE,
            middleware: [ stampLastAction ],
            devTools: isDevMode() && { name: 'example', trace: true }
        })
    ]
};
```

## Components

`counter.ts` reads the same value four ways and dispatches with [`@Dispatch`](/decorators/dispatch):

```ts
import type { Observable } from 'rxjs';
import type { AppStateInterface } from '../store/app-state';

import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Dispatch, injectSelect, Select, Select$ } from '@angular-redux2/store';

const doubled = (value$: Observable<number>) => value$.pipe(map(value => value * 2));

@Component({
    selector: 'app-counter',
    imports: [ AsyncPipe ],
    template: `
        <p class="counter">{{ counter$ | async }}</p>
        <p class="doubled">{{ doubled$ | async }}</p>
        <p class="signal">{{ counter() }}</p>
        <p class="last-action">{{ lastAction$ | async }}</p>
        <button (click)="increment()">+1</button>
        <button (click)="add(10)">+10</button>
    `
})
export class Counter {
    @Select() readonly counter$!: Observable<number>;
    @Select$('counter', doubled) readonly doubled$!: Observable<number>;
    @Select((state: AppStateInterface) => state.lastAction) readonly lastAction$!: Observable<string>;

    readonly counter = injectSelect<number>('counter');

    @Dispatch
    increment() {
        return { type: 'INCREMENT' };
    }

    @Dispatch
    add(amount: number) {
        return { type: 'ADD', payload: amount };
    }
}
```

`todos.ts` dispatches the class reducer's typed creators, so a wrong payload is a compile error:

```ts
import type { Observable } from 'rxjs';
import type { TodoInterface } from '../store/todo.reducer';

import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { TodoReducer } from '../store/todo.reducer';
import { Dispatch, Select } from '@angular-redux2/store';

@Component({
    selector: 'app-todos',
    imports: [ AsyncPipe ],
    template: `
        <button (click)="add('Write docs')">Add todo</button>
        <ul>
            @for (todo of todos$ | async; track $index) {
                <li [class.done]="todo.done" (click)="toggle($index)">{{ todo.title }}</li>
            }
        </ul>
    `
})
export class Todos {
    @Select() readonly todos$!: Observable<Array<TodoInterface>>;

    @Dispatch
    add(title: string) {
        return TodoReducer.actions.add(title); // { type: 'todos/add', payload: title }
    }

    @Dispatch
    toggle(index: number) {
        return TodoReducer.actions.toggle(index);
    }
}
```

`user.ts` is a [`@Substore`](/decorators/substore) component. Its selections and dispatches work on
`users[userId]`, and the base path follows the `userId` input:

```ts
import type { Observable } from 'rxjs';
import type { PathSelectorType } from '@angular-redux2/store';

import { AsyncPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { userReducer } from '../store/user.reducer';
import { Dispatch, Select, Substore } from '@angular-redux2/store';

@Component({
    selector: 'app-user',
    imports: [ AsyncPipe ],
    template: `
        <p>{{ name$ | async }}: {{ loc$ | async }} lines</p>
        <button (click)="addCode(100)">Add 100 lines</button>
    `
})
@Substore(userReducer)
export class User {
    readonly userId = input.required<string>();

    @Select('name') readonly name$!: Observable<string>;
    @Select('loc') readonly loc$!: Observable<number>;

    basePath = (): PathSelectorType => [ 'users', this.userId() ];

    @Dispatch
    addCode(lines: number) {
        return { type: 'ADD_LOC', payload: lines };
    }
}
```

`app.ts` puts them together, with one sub-store per user:

```ts
import { Component } from '@angular/core';
import { User } from './user/user';
import { Todos } from './todos/todos';
import { Counter } from './counter/counter';

@Component({
    selector: 'app-root',
    imports: [ Counter, Todos, User ],
    template: `
        <app-counter />
        <app-todos />
        <app-user userId="bob" />
        <app-user userId="alice" />
    `
})
export class App {}
```

::: warning `useDefineForClassFields`
The decorators need `"useDefineForClassFields": false` in `tsconfig.json`, which a new Angular project does not set.
`injectSelect` works either way. See [@Select](/decorators/select#how-the-selection-is-resolved).
:::

## Test a component

`counter.spec.ts` swaps the store for the [mock store](/testing/mocks). The selector stub feeds `@Select`, `@Select$`,
and `injectSelect` alike, and `dispatch` is a spy target:

```ts
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MockNgRedux, MockNgReduxModule } from '@angular-redux2/store/mocks';
import { Counter } from './counter';

describe('Counter', () => {
    beforeEach(() => {
        MockNgRedux.reset();
        TestBed.configureTestingModule({
            imports: [ Counter, MockNgReduxModule ],
            providers: [ provideZonelessChangeDetection() ]
        });
    });

    test('should render what the selector stub emits', async () => {
        const fixture = TestBed.createComponent(Counter);
        MockNgRedux.getSelectorStub<unknown, number>('counter').next(42);
        await fixture.whenStable();

        const element: HTMLElement = fixture.nativeElement;
        expect(element.querySelector('.counter')?.textContent).toBe('42');
        expect(element.querySelector('.doubled')?.textContent).toBe('84');
        expect(element.querySelector('.signal')?.textContent).toBe('42');
    });

    test('should dispatch the action that a method returns', () => {
        const dispatch = vi.spyOn(MockNgRedux.store, 'dispatch');

        TestBed.createComponent(Counter).componentInstance.add(5);

        expect(dispatch).toHaveBeenCalledWith({ type: 'ADD', payload: 5 });
    });
});
```

## See also

- [Getting Started](/guide)
- [NgRedux](/store/ng-redux)
- [Class reducers](/reducers/class-reducers)
- [Mocks](/testing/mocks)
