# Example

A small zoneless Angular application that uses most of the API: a slice and a plain reducer, Redux DevTools, signal
and observable selections, sub-stores that follow a signal input, and a unit test on the mock store. Each file is
complete, so the pieces can be copied into a new project as they are.

```text
src/app/
  app.config.ts          provideNgRedux
  app.ts                 the root component
  store/
    app-state.ts         the state and the root reducer
    todos.slice.ts       a slice
    user.reducer.ts      a sub-store reducer
  counter/counter.ts     injectSelect, select$, dispatch
  todos/todos.ts         typed action creators
  user/user.ts           injectSubstore
  counter/counter.spec.ts
```

## The state

`todos.slice.ts` holds the todos and their actions:

```ts
import { createSlice } from '@angular-redux2/store';

export interface TodoInterface {
    title: string;
    done: boolean;
}

export const todos = createSlice('todos', <Array<TodoInterface>> [], {
    add(state, title: string) {
        state.push({ title, done: false });
    },
    toggle(state, index: number) {
        state[index].done = !state[index].done;
    }
});
```

`user.reducer.ts` is the reducer of one user, used through a sub-store:

```ts
import { draft } from '@angular-redux2/store';

export interface UserInterface {
    name: string;
    loc: number;
}

export const userReducer = draft(<UserInterface> { name: '', loc: 0 }, (state, action) => {
    if (action.type === 'ADD_LOC') state.loc += <number> action['payload'];
});
```

`app-state.ts` combines them, and wraps the root reducer to record the last action:

```ts
import type { Reducer } from 'redux';
import type { UserInterface } from './user.reducer';
import type { PayloadActionInterface } from '@angular-redux2/store';

import { combineReducers } from 'redux';
import { todos, type TodoInterface } from './todos.slice';

export interface AppState {
    counter: number;
    todos: Array<TodoInterface>;
    users: Record<string, UserInterface>;
    lastAction: string;
}

export const INITIAL_STATE: AppState = {
    counter: 0,
    todos: [],
    users: {
        bob: { name: 'Bob Smith', loc: 1023 },
        alice: { name: 'Alice Jones', loc: 2314 }
    },
    lastAction: ''
};

function counter(state = 0, action: PayloadActionInterface<number>): number {
    if (action.type === 'INCREMENT') return state + 1;
    if (action.type === 'ADD') return state + (action.payload ?? 0);

    return state;
}

const stampLastAction = (reducer: Reducer<AppState>): Reducer<AppState> =>
    (state, action) => ({ ...reducer(state, action), lastAction: action.type });

export const rootReducer = stampLastAction(<Reducer<AppState>> combineReducers({
    counter,
    todos: todos.reducer,
    users: (state: Record<string, UserInterface> = INITIAL_STATE.users) => state,
    lastAction: (state = '') => state
}));
```

## The store

```ts
import type { ApplicationConfig } from '@angular/core';

import { provideNgRedux } from '@angular-redux2/store';
import { INITIAL_STATE, rootReducer } from './store/app-state';
import { isDevMode, provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideNgRedux({
            reducer: rootReducer,
            initialState: INITIAL_STATE,
            devTools: isDevMode() && { name: 'angular-redux2 demo' },
            freeze: isDevMode()
        })
    ]
};
```

## Components

`counter.ts` reads with signals, derives an observable with `select$`, and dispatches:

```ts
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { injectSelect, NgRedux } from '@angular-redux2/store';
import type { AppState } from '../store/app-state';

@Component({
    selector: 'app-counter',
    imports: [ AsyncPipe ],
    template: `
        <p class="counter">{{ count() }}</p>
        <p class="doubled">{{ doubled$ | async }}</p>
        <p class="last-action">{{ lastAction() }}</p>
        <button class="increment" (click)="increment()">+1</button>
        <button class="add" (click)="add(10)">+10</button>
    `
})
export class Counter {
    private readonly store = inject(NgRedux<AppState>);

    readonly count = injectSelect((state: AppState) => state.counter);
    readonly lastAction = injectSelect((state: AppState) => state.lastAction);
    readonly doubled$ = this.store.select$(state => state.counter).pipe(map(value => value * 2));

    increment(): void {
        this.store.dispatch({ type: 'INCREMENT' });
    }

    add(amount: number): void {
        this.store.dispatch({ type: 'ADD', payload: amount });
    }
}
```

`todos.ts` dispatches through the typed action creators of the slice:

```ts
import { Component, inject } from '@angular/core';
import { injectSelect, NgRedux } from '@angular-redux2/store';
import { todos } from '../store/todos.slice';
import type { AppState } from '../store/app-state';

@Component({
    selector: 'app-todos',
    template: `
        <button class="add-todo" (click)="add('Write docs')">Add todo</button>
        <ul>
            @for (todo of list(); track $index) {
                <li [class.done]="todo.done" (click)="toggle($index)">{{ todo.title }}</li>
            }
        </ul>
    `
})
export class Todos {
    private readonly store = inject(NgRedux<AppState>);

    readonly list = injectSelect((state: AppState) => state.todos);

    add(title: string): void {
        this.store.dispatch(todos.actions.add(title));
    }

    toggle(index: number): void {
        this.store.dispatch(todos.actions.toggle(index));
    }
}
```

`user.ts` works on `users[userId]` through a sub-store that follows the signal input:

```ts
import { Component, input } from '@angular/core';
import { injectSubstore } from '@angular-redux2/store';
import { userReducer } from '../store/user.reducer';

@Component({
    selector: 'app-user',
    template: `
        <p class="user">{{ name() }}: <span class="loc">{{ loc() }}</span> lines</p>
        <button class="add-loc" (click)="addCode(100)">Add 100 lines</button>
    `
})
export class User {
    readonly userId = input.required<string>();

    private readonly user = injectSubstore(() => [ 'users', this.userId() ], userReducer);

    readonly name = this.user.select(user => user.name);
    readonly loc = this.user.select(user => user.loc);

    addCode(lines: number): void {
        this.user.dispatch({ type: 'ADD_LOC', payload: lines });
    }
}
```

`app.ts` puts them together:

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

## A unit test

`counter.spec.ts` runs the component on the mock store:

```ts
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MockNgRedux, provideMockNgRedux } from '@angular-redux2/store/mocks';
import { Counter } from './counter';
import { INITIAL_STATE, type AppState } from '../store/app-state';

describe('Counter', () => {
    let store: MockNgRedux<AppState>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ Counter ],
            providers: [ provideZonelessChangeDetection(), provideMockNgRedux(INITIAL_STATE) ]
        });
        store = TestBed.inject(MockNgRedux<AppState>);
    });

    test('should render the state that the test sets', async () => {
        const fixture = TestBed.createComponent(Counter);

        store.patchState({ counter: 42 });
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('.counter').textContent).toBe('42');
        expect(fixture.nativeElement.querySelector('.doubled').textContent).toBe('84');
    });

    test('should record what the component dispatches', () => {
        TestBed.createComponent(Counter).componentInstance.add(5);

        expect(store.dispatched).toEqual([{ type: 'ADD', payload: 5 }]);
    });
});
```

## See also

- [Getting Started](/guide)
- [Sub-stores](/store/sub-store)
- [Mocks](/testing/mocks)
