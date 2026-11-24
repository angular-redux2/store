/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction } from 'redux';

/**
 * Imports
 */

import { signal } from '@angular/core';
import { NgRedux } from '@services/ng-redux.service';
import { pathOf } from '@services/sub-store.service';
import { SUBSTORE_ROUTE } from '@constants/sub-store.constant';

/**
 * Tests
 */

interface UserInterface {
    name: string;
    loc: number;
    address?: { city: string };
}

function createStore(): NgRedux<{ users: Record<string, UserInterface> }> {
    const users: Record<string, UserInterface> = {
        bob: { name: 'Bob', loc: 10, address: { city: 'Paris' } },
        alice: { name: 'Alice', loc: 20 }
    };

    return new NgRedux({ reducer: (state = { users }) => state, initialState: { users } });
}

function userReducer(state: UserInterface = { name: '', loc: 0 }, action: UnknownAction): UserInterface {
    return action.type === 'ADD_LOC' ? { ...state, loc: state.loc + <number> action['payload'] } : state;
}

function cityReducer(state: { city: string } = { city: '' }, action: UnknownAction): { city: string } {
    return action.type === 'MOVE' ? { city: <string> action['payload'] } : state;
}

describe('pathOf', () => {
    test('should turn a fixed path into a function that returns it', () => {
        expect(pathOf([ 'users', 'bob' ])()).toEqual([ 'users', 'bob' ]);
    });

    test('should keep a computed path as it is', () => {
        const path = (): Array<string> => [ 'users' ];

        expect(pathOf(path)).toBe(path);
    });
});

describe('SubStore', () => {
    describe('state', () => {
        test('should hold the branch at the base path', () => {
            const bob = createStore().substore([ 'users', 'bob' ], userReducer);

            expect(bob.state()).toEqual({ name: 'Bob', loc: 10, address: { city: 'Paris' } });
        });

        test('should be undefined for a path that leads nowhere', () => {
            expect(createStore().substore([ 'users', 'eve' ], userReducer).state()).toBeUndefined();
        });

        test('should move to the branch of a new computed path', () => {
            const userId = signal('bob');
            const user = createStore().substore<UserInterface>(() => [ 'users', userId() ], userReducer);

            userId.set('alice');

            expect(user.getState().name).toBe('Alice');
        });
    });

    describe('dispatch', () => {
        test('should return the original action and leave it without a route', () => {
            const bob = createStore().substore([ 'users', 'bob' ], userReducer);
            const action = { type: 'ADD_LOC', payload: 5 };

            expect(bob.dispatch(action)).toBe(action);
            expect(SUBSTORE_ROUTE in action).toBe(false);
        });

        test('should update its own state signal', () => {
            const bob = createStore().substore<UserInterface>([ 'users', 'bob' ], userReducer);
            bob.dispatch({ type: 'ADD_LOC', payload: 5 });

            expect(bob.state().loc).toBe(15);
        });

        test('should route the action to the path that the base path holds at that moment', () => {
            const ngRedux = createStore();
            const userId = signal('bob');
            const user = ngRedux.substore(() => [ 'users', userId() ], userReducer);

            userId.set('alice');
            user.dispatch({ type: 'ADD_LOC', payload: 5 });

            expect(ngRedux.getState().users['alice'].loc).toBe(25);
            expect(ngRedux.getState().users['bob'].loc).toBe(10);
        });
    });

    describe('substore', () => {
        test('should continue the path of the substore that creates it', () => {
            const ngRedux = createStore();
            const address = ngRedux.substore([ 'users', 'bob' ], userReducer).substore([ 'address' ], cityReducer);

            address.dispatch({ type: 'MOVE', payload: 'Rome' });

            expect(address.getState()).toEqual({ city: 'Rome' });
            expect(ngRedux.getState().users['bob'].address).toEqual({ city: 'Rome' });
        });

        test('should follow a move of the parent path', () => {
            const userId = signal('bob');
            const ngRedux = createStore();
            ngRedux.getState().users['alice'].address = { city: 'Oslo' };
            const address = ngRedux.substore(() => [ 'users', userId() ], userReducer).substore([ 'address' ], cityReducer);

            userId.set('alice');

            expect(address.getState()).toEqual({ city: 'Oslo' });
        });
    });

    describe('select$', () => {
        test('should emit only when its branch changes', () => {
            const ngRedux = createStore();
            const locs: Array<number> = [];
            const bob = ngRedux.substore<UserInterface>([ 'users', 'bob' ], userReducer);
            const alice = ngRedux.substore<UserInterface>([ 'users', 'alice' ], userReducer);
            bob.select$(state => state.loc).subscribe(loc => locs.push(loc));

            alice.dispatch({ type: 'ADD_LOC', payload: 1 });
            bob.dispatch({ type: 'ADD_LOC', payload: 1 });

            expect(locs).toEqual([ 10, 11 ]);
        });
    });
});
