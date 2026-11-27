/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { InteropObservable } from 'rxjs';
import type { Middleware, Reducer, StoreEnhancer, UnknownAction } from 'redux';

/**
 * Imports
 */

import { from } from 'rxjs';
import { signal } from '@angular/core';
import { combineReducers } from 'redux';
import { NgRedux } from './ng-redux.service';
import { SUBSTORE_ROUTE } from '../constants/sub-store.constant';

/**
 * Tests
 */

interface AppStateInterface {
    counter: number;
    users: Record<string, { name: string; loc: number }>;
    todos?: Array<string>;
}

const INITIAL_STATE: AppStateInterface = {
    counter: 0,
    users: { bob: { name: 'Bob', loc: 10 }, alice: { name: 'Alice', loc: 20 } }
};

function counter(state = 0, action: UnknownAction): number {
    if (action.type === 'INCREMENT') return state + 1;
    if (action.type === 'ADD') return state + <number> action['payload'];

    return state;
}

const rootReducer = <Reducer<AppStateInterface>> combineReducers({
    counter,
    users: (state: AppStateInterface['users'] = INITIAL_STATE.users) => state
});

function userReducer(state: { name: string; loc: number } = { name: '', loc: 0 }, action: UnknownAction): { name: string; loc: number } {
    return action.type === 'ADD_LOC' ? { ...state, loc: state.loc + <number> action['payload'] } : state;
}

function createStore(): NgRedux<AppStateInterface> {
    return new NgRedux({ reducer: rootReducer, initialState: INITIAL_STATE });
}

describe('NgRedux', () => {
    afterEach(() => {
        xJet.restoreAllMocks();
        delete (<any> globalThis).__REDUX_DEVTOOLS_EXTENSION__;
    });

    describe('constructor', () => {
        test('should start from the initial state', () => {
            expect(createStore().getState()).toBe(INITIAL_STATE);
        });

        test('should start from the reducer defaults without an initial state', () => {
            const ngRedux = new NgRedux({ reducer: rootReducer });

            expect(ngRedux.getState()).toEqual(INITIAL_STATE);
        });

        test('should run the middleware on every dispatch', () => {
            const seen: Array<string> = [];
            const logger: Middleware = () => next => action => {
                seen.push((<UnknownAction> action).type);

                return next(action);
            };
            const ngRedux = new NgRedux({ reducer: rootReducer, middleware: [ logger ] });
            ngRedux.dispatch({ type: 'INCREMENT' });

            expect(seen).toEqual([ 'INCREMENT' ]);
        });

        test('should apply the enhancers', () => {
            const enhancer: StoreEnhancer = createStore => (reducer, preloaded) => ({ ...createStore(reducer, preloaded), marked: true });
            const ngRedux = new NgRedux({ reducer: rootReducer, enhancers: [ enhancer ] });

            expect((<any> ngRedux.redux).marked).toBe(true);
        });

        test('should connect the Redux DevTools extension with the given options', () => {
            const extension = xJet.fn((): StoreEnhancer => createStore => createStore);
            (<any> globalThis).__REDUX_DEVTOOLS_EXTENSION__ = extension;

            new NgRedux({ reducer: rootReducer, devTools: { name: 'demo' } });
            new NgRedux({ reducer: rootReducer, devTools: true });

            expect(extension).toHaveBeenNthCalledWith(1, { name: 'demo' });
            expect(extension).toHaveBeenNthCalledWith(2, undefined);
        });

        test('should skip the Redux DevTools extension when devTools is off', () => {
            const extension = xJet.fn((): StoreEnhancer => createStore => createStore);
            (<any> globalThis).__REDUX_DEVTOOLS_EXTENSION__ = extension;

            new NgRedux({ reducer: rootReducer });

            expect(extension).not.toHaveBeenCalled();
        });

        test('should work without the extension installed when devTools is on', () => {
            expect(new NgRedux({ reducer: rootReducer, devTools: true }).getState()).toEqual(INITIAL_STATE);
        });

        test('should freeze every state when freeze is on', () => {
            const ngRedux = new NgRedux({ reducer: rootReducer, initialState: structuredClone(INITIAL_STATE), freeze: true });
            ngRedux.dispatch({ type: 'INCREMENT' });

            expect(Object.isFrozen(ngRedux.getState())).toBe(true);
            expect(Object.isFrozen(ngRedux.getState().users['bob'])).toBe(true);
        });
    });

    describe('dispatch', () => {
        test('should return what a middleware returns', () => {
            const thunk: Middleware = () => next => action => typeof action === 'function' ? action() : next(action);
            const ngRedux = new NgRedux({ reducer: rootReducer, middleware: [ thunk ] });

            expect(ngRedux.dispatch(<any> (() => 'done'))).toBe('done');
        });

        test('should update the state signal before it returns', () => {
            const ngRedux = createStore();

            expect(ngRedux.dispatch({ type: 'ADD', payload: 5 })).toEqual({ type: 'ADD', payload: 5 });
            expect(ngRedux.state().counter).toBe(5);
        });

        test('should keep the same state object for an action that changes nothing', () => {
            const ngRedux = createStore();
            ngRedux.dispatch({ type: 'UNKNOWN' });

            expect(ngRedux.getState()).toBe(INITIAL_STATE);
        });
    });

    describe('select', () => {
        test('should follow the state after each dispatch', () => {
            const ngRedux = createStore();
            const count = ngRedux.select(state => state.counter);

            expect(count()).toBe(0);
            ngRedux.dispatch({ type: 'INCREMENT' });
            expect(count()).toBe(1);
        });

        test('should keep the previous value while equal calls the new one equal', () => {
            const ngRedux = createStore();
            const names = ngRedux.select(state => Object.keys(state.users), {
                equal: (previous, next) => previous.join() === next.join()
            });
            const first = names();

            ngRedux.dispatch({ type: 'INCREMENT' });

            expect(names()).toBe(first);
        });
    });

    describe('select$', () => {
        test('should emit the current value on subscribe and each change after it, synchronously', () => {
            const ngRedux = createStore();
            const values: Array<number> = [];
            ngRedux.select$(state => state.counter).subscribe(value => values.push(value));

            ngRedux.dispatch({ type: 'INCREMENT' });
            ngRedux.dispatch({ type: 'INCREMENT' });

            expect(values).toEqual([ 0, 1, 2 ]);
        });

        test('should emit nothing for an action that leaves the value unchanged', () => {
            const ngRedux = createStore();
            const values: Array<string> = [];
            ngRedux.select$(state => state.users['bob'].name).subscribe(value => values.push(value));

            ngRedux.dispatch({ type: 'INCREMENT' });

            expect(values).toEqual([ 'Bob' ]);
        });

        test('should stop listening once it unsubscribes', () => {
            const ngRedux = createStore();
            const values: Array<number> = [];
            const subscription = ngRedux.select$(state => state.counter).subscribe(value => values.push(value));

            subscription.unsubscribe();
            ngRedux.dispatch({ type: 'INCREMENT' });

            expect(values).toEqual([ 0 ]);
        });
    });

    describe('interop observable', () => {
        test('should work with RxJS from without a Symbol.observable polyfill', () => {
            const ngRedux = createStore();
            const counters: Array<number> = [];
            const subscription = from(<InteropObservable<AppStateInterface>> <unknown> ngRedux).subscribe(state => counters.push(state.counter));

            ngRedux.dispatch({ type: 'INCREMENT' });
            subscription.unsubscribe();
            ngRedux.dispatch({ type: 'INCREMENT' });

            expect(counters).toEqual([ 0, 1 ]);
        });

        test('should work with RxJS from on a substore', () => {
            const bob = createStore().substore<{ name: string; loc: number }>([ 'users', 'bob' ], userReducer);
            const locs: Array<number> = [];
            from(<InteropObservable<{ name: string; loc: number }>> <unknown> bob).subscribe(state => locs.push(state.loc));

            bob.dispatch({ type: 'ADD_LOC', payload: 5 });

            expect(locs).toEqual([ 10, 15 ]);
        });
    });

    describe('substore', () => {
        test('should read the branch at its path', () => {
            const bob = createStore().substore<{ name: string; loc: number }>([ 'users', 'bob' ], userReducer);

            expect(bob.getState()).toEqual({ name: 'Bob', loc: 10 });
        });

        test('should run only its reducer on its branch and share every other branch', () => {
            const ngRedux = createStore();
            const before = ngRedux.getState();

            ngRedux.substore([ 'users', 'bob' ], userReducer).dispatch({ type: 'ADD_LOC', payload: 5 });

            expect(ngRedux.getState().users['bob'].loc).toBe(15);
            expect(ngRedux.getState().users['alice']).toBe(before.users['alice']);
            expect(ngRedux.getState().counter).toBe(0);
        });

        test('should keep the same state when its reducer changes nothing', () => {
            const ngRedux = createStore();
            ngRedux.substore([ 'users', 'bob' ], userReducer).dispatch({ type: 'OTHER' });

            expect(ngRedux.getState()).toBe(INITIAL_STATE);
        });

        test('should register a shared reducer once', () => {
            const ngRedux = createStore();
            const actions: Array<UnknownAction> = [];
            ngRedux.redux.subscribe(() => undefined);
            xJet.spyOn(ngRedux.redux, 'dispatch').mockImplementation((action: any) => {
                actions.push(action);

                return action;
            });

            ngRedux.substore([ 'users', 'bob' ], userReducer).dispatch({ type: 'A' });
            ngRedux.substore([ 'users', 'alice' ], userReducer).dispatch({ type: 'B' });

            expect(actions.map(action => (<any> action[SUBSTORE_ROUTE]).id)).toEqual([ 0, 0 ]);
        });

        test('should forget an inline reducer once its substore is destroyed', () => {
            const ngRedux = createStore();
            for (let index = 0; index < 100; index++) {
                ngRedux.substore([ 'users', 'bob' ], (state: unknown = null) => state).destroy();
            }

            expect((<any> ngRedux).substoreReducers.size).toBe(0);
            expect((<any> ngRedux).substoreIds.size).toBe(0);
        });

        test('should keep a shared reducer until its last substore is destroyed', () => {
            const ngRedux = createStore();
            const bob = ngRedux.substore([ 'users', 'bob' ], userReducer);
            const alice = ngRedux.substore([ 'users', 'alice' ], userReducer);

            bob.destroy();
            bob.destroy();
            alice.dispatch({ type: 'ADD_LOC', payload: 5 });

            expect(ngRedux.getState().users['alice'].loc).toBe(25);
            alice.destroy();
            expect((<any> ngRedux).substoreReducers.size).toBe(0);
        });

        test('should give a new reducer a new id after an old one is forgotten', () => {
            const ngRedux = createStore();
            ngRedux.substore([ 'users', 'bob' ], userReducer).destroy();
            const alice = ngRedux.substore([ 'users', 'alice' ], (state: any, action: UnknownAction) =>
                action.type === 'RENAME' ? { ...state, name: 'Al' } : state);

            alice.dispatch({ type: 'RENAME' });

            expect(ngRedux.getState().users['alice'].name).toBe('Al');
        });

        test('should hand a thunk to the middleware unchanged', () => {
            const thunk: Middleware = api => next => action =>
                typeof action === 'function' ? action(api.dispatch, api.getState) : next(action);
            const ngRedux = new NgRedux({ reducer: rootReducer, initialState: INITIAL_STATE, middleware: [ thunk ] });
            const bob = ngRedux.substore([ 'users', 'bob' ], userReducer);

            const result = bob.dispatch(<any> ((dispatch: (action: UnknownAction) => void) => {
                dispatch({ type: 'INCREMENT' });

                return 'done';
            }));

            expect(result).toBe('done');
            expect(ngRedux.getState().counter).toBe(1);
        });

        test('should hand an action with an unknown substore id to the root reducer', () => {
            const ngRedux = createStore();
            ngRedux.dispatch({ type: 'INCREMENT', [SUBSTORE_ROUTE]: { id: 99, path: [ 'users' ] } });

            expect(ngRedux.getState().counter).toBe(1);
        });

        test('should write a new frozen state when freeze is on', () => {
            const ngRedux = new NgRedux({ reducer: rootReducer, initialState: structuredClone(INITIAL_STATE), freeze: true });
            ngRedux.substore([ 'users', 'bob' ], userReducer).dispatch({ type: 'ADD_LOC', payload: 5 });

            expect(ngRedux.getState().users['bob'].loc).toBe(15);
            expect(Object.isFrozen(ngRedux.getState().users['bob'])).toBe(true);
        });

        test('should route to its branch while feature reducers run', () => {
            const ngRedux = createStore();
            ngRedux.addReducer('todos', (state: Array<string> = []) => state);

            ngRedux.substore([ 'users', 'bob' ], userReducer).dispatch({ type: 'ADD_LOC', payload: 5 });

            expect(ngRedux.getState().users['bob'].loc).toBe(15);
            expect(ngRedux.getState().todos).toEqual([]);
        });

        test('should follow a computed path', () => {
            const userId = signal('bob');
            const user = createStore().substore(() => [ 'users', userId() ], userReducer);
            const name = user.select(state => (<{ name: string }> state).name);

            expect(name()).toBe('Bob');
            userId.set('alice');
            expect(name()).toBe('Alice');
        });
    });

    describe('addReducer', () => {
        const todos = (state: Array<string> = [], action: UnknownAction): Array<string> =>
            action.type === 'ADD_TODO' ? [ ...state, <string> action['payload'] ] : state;

        test('should set the initial state of the feature as soon as it is added', () => {
            const ngRedux = createStore();
            ngRedux.addReducer('todos', todos);

            expect(ngRedux.getState().todos).toEqual([]);
        });

        test('should run the feature reducer and keep the root reducer running', () => {
            const ngRedux = createStore();
            ngRedux.addReducer('todos', todos);

            ngRedux.dispatch({ type: 'ADD_TODO', payload: 'a' });
            ngRedux.dispatch({ type: 'INCREMENT' });

            expect(ngRedux.getState().todos).toEqual([ 'a' ]);
            expect(ngRedux.getState().counter).toBe(1);
        });

        test('should hide the feature key from combineReducers, so it neither drops nor warns about it', () => {
            const error = xJet.spyOn(console, 'error').mockImplementation(() => undefined);
            const ngRedux = createStore();
            ngRedux.addReducer('todos', todos);

            ngRedux.dispatch({ type: 'INCREMENT' });

            expect(ngRedux.getState().todos).toEqual([]);
            expect(error).not.toHaveBeenCalled();
        });

        test('should keep the same state object when no reducer changed anything', () => {
            const ngRedux = createStore();
            ngRedux.addReducer('todos', todos);
            const before = ngRedux.getState();

            ngRedux.dispatch({ type: 'UNKNOWN' });

            expect(ngRedux.getState()).toBe(before);
        });

        test('should replace the reducer of a key with a different one', () => {
            const ngRedux = createStore();
            ngRedux.addReducer('todos', todos);
            ngRedux.addReducer('todos', (state: Array<string> = [], action: UnknownAction) =>
                action.type === 'ADD_TODO' ? [ ...state, 'replaced' ] : state);

            ngRedux.dispatch({ type: 'ADD_TODO', payload: 'a' });

            expect(ngRedux.getState().todos).toEqual([ 'replaced' ]);
        });

        test('should start a feature from its key in the initial state, though combineReducers dropped it', () => {
            const error = xJet.spyOn(console, 'error').mockImplementation(() => undefined);
            const ngRedux = new NgRedux<AppStateInterface>({ reducer: rootReducer, initialState: { ...INITIAL_STATE, todos: [ 'server' ] } });
            ngRedux.addReducer('todos', todos);

            expect(ngRedux.getState().todos).toEqual([ 'server' ]);
            ngRedux.dispatch({ type: 'ADD_TODO', payload: 'a' });
            expect(ngRedux.getState().todos).toEqual([ 'server', 'a' ]);
            error.mockRestore();
        });

        test('should start a feature from what the root reducer put on its key', () => {
            const ngRedux = new NgRedux<AppStateInterface>({
                reducer: (state = INITIAL_STATE, action) => action.type === 'SET' ? <AppStateInterface> action['state'] : state
            });
            ngRedux.addReducer('todos', todos);

            ngRedux.dispatch({ type: 'SET', state: { ...INITIAL_STATE, todos: [ 'set' ] } });

            expect(ngRedux.getState().todos).toEqual([ 'set' ]);
        });

        test('should do nothing when the same reducer is added for the same key again', () => {
            const ngRedux = createStore();
            ngRedux.addReducer('todos', todos);
            const replace = xJet.spyOn(ngRedux.redux, 'replaceReducer');

            ngRedux.addReducer('todos', todos);

            expect(replace).not.toHaveBeenCalled();
        });
    });
});
