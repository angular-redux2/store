/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction } from 'redux';
import type { ReducerActionsType } from '@interfaces/store.interface';

/**
 * Imports
 */

import { types } from 'util';
import { firstValueFrom } from 'rxjs';
import { combineReducers } from 'redux';
import { NgRedux } from '@services/ng-redux.service';
import { Action } from '@decorators/action.decorator';
import { AbstractReducer } from '@abstract/reducer.abstract';

/**
 * Tests
 */

interface ProfileInterface {
    name: string;
    nickname: string | null;
    joined: Date;
    tags: Array<string>;
}

interface StateInterface {
    profile: ProfileInterface;
    counter: number;
    users: Record<string, { loc: number }>;
}

const JOINED = new Date('2024-01-02T03:04:05.000Z');

function createStore(reducer: (state: StateInterface, action: UnknownAction) => StateInterface): NgRedux<StateInterface> {
    const ngRedux = new NgRedux<StateInterface>();
    ngRedux.configureStore(<any> reducer, {
        counter: 0,
        users: { bob: { loc: 10 } },
        profile: { name: 'Bob', nickname: null, joined: JOINED, tags: [ 'a' ] }
    });

    return ngRedux;
}

describe('draft state', () => {
    test('should read a null property of the draft without throwing (issue #34)', () => {
        let read: unknown = 'unset';
        const ngRedux = createStore((state, action) => {
            if (action.type === 'READ') {
                read = state.profile.nickname;
            }

            return state;
        });

        ngRedux.dispatch({ type: 'READ' });

        expect(read).toBeNull();
    });

    test('should write next to a null property and keep it null (issue #34)', () => {
        const ngRedux = createStore((state, action) => {
            if (action.type === 'RENAME') {
                state.profile.name = 'Robert';
            }

            return state;
        });

        ngRedux.dispatch({ type: 'RENAME' });

        expect(ngRedux.getState().profile.name).toBe('Robert');
        expect(ngRedux.getState().profile.nickname).toBeNull();
    });

    test('should hand a Date to the reducer unproxied, so its methods work (PR #31)', () => {
        let year = 0;
        const ngRedux = createStore((state, action) => {
            if (action.type === 'YEAR') {
                year = state.profile.joined.getUTCFullYear();
            }

            return state;
        });

        ngRedux.dispatch({ type: 'YEAR' });

        expect(year).toBe(2024);
        expect(ngRedux.getState().profile.joined).toBe(JOINED);
    });
});

describe('draft state immutability', () => {
    function createDraftStore(): NgRedux<any> {
        const ngRedux = new NgRedux<any>();
        ngRedux.configureStore(<any> ((state: any, action: UnknownAction) => {
            if (action.type === 'NESTED') state.profile.name = 'Robert';
            if (action.type === 'PUSH') state.tags.push('b');
            if (action.type === 'TOP') state.counter = 1;

            return state;
        }), { counter: 0, profile: { name: 'Bob' }, tags: [ 'a' ], other: { deep: { value: 1 } } });

        return ngRedux;
    }

    test('should leave every earlier state as it was', () => {
        const ngRedux = createDraftStore();
        const s0 = ngRedux.getState();
        ngRedux.dispatch({ type: 'NESTED' });
        const s1 = ngRedux.getState();
        ngRedux.dispatch({ type: 'PUSH' });
        const s2 = ngRedux.getState();
        ngRedux.dispatch({ type: 'TOP' });

        expect(s0).toEqual({ counter: 0, profile: { name: 'Bob' }, tags: [ 'a' ], other: { deep: { value: 1 } } });
        expect(s1).toEqual({ counter: 0, profile: { name: 'Robert' }, tags: [ 'a' ], other: { deep: { value: 1 } } });
        expect(s2).toEqual({ counter: 0, profile: { name: 'Robert' }, tags: [ 'a', 'b' ], other: { deep: { value: 1 } } });
        expect(Object.keys(s2)).toEqual([ 'counter', 'profile', 'tags', 'other' ]);
    });

    test('should copy only the path to a write and share every other branch', () => {
        const ngRedux = createDraftStore();
        const before = ngRedux.getState();
        ngRedux.dispatch({ type: 'NESTED' });
        const after = ngRedux.getState();

        expect(after).not.toBe(before);
        expect(after.profile).not.toBe(before.profile);
        expect(after.tags).toBe(before.tags);
        expect(after.other).toBe(before.other);
    });

    test('should return the same state when the reducer only reads', () => {
        const ngRedux = createDraftStore();
        const before = ngRedux.getState();
        ngRedux.dispatch({ type: 'NOTHING' });

        expect(ngRedux.getState()).toBe(before);
    });

    test('should resolve drafts inside a returned copy', () => {
        const ngRedux = new NgRedux<any>();
        ngRedux.configureStore(<any> ((state: any, action: UnknownAction) =>
            action.type === 'SPREAD' ? { ...state, counter: state.counter + 1 } : state
        ), { counter: 0, profile: { name: 'Bob' } });

        const before = ngRedux.getState();
        ngRedux.dispatch({ type: 'SPREAD' });

        expect(ngRedux.getState()).toEqual({ counter: 1, profile: { name: 'Bob' } });
        expect(ngRedux.getState().profile).toBe(before.profile);
    });
});

describe('class reducer action creators', () => {
    class CounterReducer extends AbstractReducer {
        static override actions: ReducerActionsType<CounterReducer>;

        @Action
        set(_: number, value: number): number {
            return value;
        }
    }

    test('should keep a falsy payload such as 0', () => {
        expect(CounterReducer.actions.set(0)).toEqual({ type: 'CounterReducer/set', payload: 0 });
    });

    test('should reduce to a falsy payload', () => {
        const reducer = CounterReducer.createReducer<number>(5);

        expect(reducer(5, CounterReducer.actions.set(0))).toBe(0);
    });
});

describe('sub-store selections', () => {
    test('should emit the slice at the base path without a call to setBasePath', async () => {
        const ngRedux = createStore(state => state);
        const bob = ngRedux.configureSubStore<{ loc: number }>([ 'users', 'bob' ], (state = { loc: 0 }) => state);

        expect(await firstValueFrom(bob.select('loc'))).toBe(10);
    });

    test('should emit the slice through Symbol.observable, as from(subStore) reads it', async () => {
        const ngRedux = createStore(state => state);
        const bob = ngRedux.configureSubStore<{ loc: number }>([ 'users', 'bob' ], (state = { loc: 0 }) => state);

        expect(await firstValueFrom((<any> bob)[Symbol.observable]())).toEqual({ loc: 10 });
    });

    test('should emit again after a sub-store dispatch', async () => {
        const ngRedux = createStore(state => state);
        const bob = ngRedux.configureSubStore<{ loc: number }>([ 'users', 'bob' ], (state = { loc: 0 }, action) => {
            if (action.type === 'ADD_LOC') {
                state.loc += 5;
            }

            return state;
        });

        bob.dispatch({ type: 'ADD_LOC' });

        expect(await firstValueFrom(bob.select('loc'))).toBe(15);
        expect(ngRedux.getState().users['bob'].loc).toBe(15);
    });
});

describe('issue #34: a combined reducer reading through null', () => {
    interface CheckoutInterface {
        address: { street: string } | null;
        step: number;
    }

    function checkoutReducer(state: CheckoutInterface = { address: null, step: 0 }, action: UnknownAction): CheckoutInterface {
        if (state.address !== null && state.address.street === '') {
            return state;
        }

        return action.type === 'NEXT' ? { ...state, step: state.step + 1 } : state;
    }

    function configure(): NgRedux<{ checkout: CheckoutInterface }> {
        const ngRedux = new NgRedux<{ checkout: CheckoutInterface }>();
        ngRedux.configureStore(<any> combineReducers({ checkout: checkoutReducer }), <any> undefined);

        return ngRedux;
    }

    test('should survive the probe actions that combineReducers dispatches at creation', () => {
        expect(() => configure()).not.toThrow();
    });

    test('should reduce an action without throwing on the null branch', () => {
        const ngRedux = configure();
        ngRedux.dispatch({ type: 'NEXT' });

        expect(ngRedux.getState()).toEqual({ checkout: { address: null, step: 1 } });
    });

    test('should leave no proxy in the stored state', () => {
        const ngRedux = configure();
        ngRedux.dispatch({ type: 'NEXT' });
        const state = ngRedux.getState();

        expect(types.isProxy(state)).toBe(false);
        expect(types.isProxy(state.checkout)).toBe(false);
    });
});

describe('issue #3: selections emit only real changes', () => {
    test('should emit nothing before the store is configured, then the current value once', () => {
        const ngRedux = new NgRedux<StateInterface>();
        const seen: Array<number> = [];
        ngRedux.select<number>('counter').subscribe(value => seen.push(value));

        expect(seen).toEqual([]);

        ngRedux.configureStore(<any> ((state: StateInterface) => state), <any> { counter: 7, users: {}, profile: {} });
        ngRedux.dispatch({ type: 'UNRELATED' });

        expect(seen).toEqual([ 7 ]);
    });
});
