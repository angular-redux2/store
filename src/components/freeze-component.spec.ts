/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction } from 'redux';

/**
 * Imports
 */

import { createStore } from 'redux';
import { NgRedux } from '@services/ng-redux.service';
import { freezeState } from '@components/freeze.component';

/**
 * Tests
 */

class Point {
    x = 1;
}

function createState(): any {
    return {
        user: { name: 'Ada', tags: [ 'admin' ] },
        joined: new Date(Date.UTC(2024, 0, 1)),
        lookup: new Map([[ 'a', 1 ]]),
        point: new Point()
    };
}

function reducer(state: any = createState(), action: UnknownAction): any {
    return action.type === 'RENAME' ? { ...state, user: { ...state.user, name: action['name'] } } : state;
}

describe('freezeState', () => {
    describe('the state it freezes', () => {
        test('should freeze the initial state, nested objects and arrays included', () => {
            const state = createState();
            createStore(reducer, state, freezeState());

            expect(Object.isFrozen(state)).toBe(true);
            expect(Object.isFrozen(state.user)).toBe(true);
            expect(Object.isFrozen(state.user.tags)).toBe(true);
        });

        test('should freeze each state that the reducer returns', () => {
            const store = createStore(reducer, createState(), freezeState());
            store.dispatch({ type: 'RENAME', name: 'Bob' });

            expect(Object.isFrozen(store.getState().user)).toBe(true);
            expect(() => {
                store.getState().user.name = 'Eve';
            }).toThrow(TypeError);
        });

        test('should freeze the states of a reducer passed to replaceReducer', () => {
            const store = createStore(reducer, createState(), freezeState());
            store.replaceReducer((state: any) => ({ ...state, fresh: { value: 1 } }));

            expect(Object.isFrozen(store.getState().fresh)).toBe(true);
        });
    });

    describe('the values it leaves alone', () => {
        test.each(
            { case: 'a Date', key: 'joined' },
            { case: 'a Map', key: 'lookup' },
            { case: 'a class instance', key: 'point' }
        )('should leave $case unfrozen, so its methods and fields keep working', ({ key }: any) => {
            const state = createState();
            createStore(reducer, state, freezeState());

            expect(Object.isFrozen(state[key])).toBe(false);
        });
    });

    describe('with NgRedux', () => {
        test('should let a reducer write to its draft of a frozen state', () => {
            const ngRedux = new NgRedux<any>();
            const draftReducer = (state: any = createState(), action: UnknownAction): any => {
                if (action.type === 'RENAME') {
                    state.user.name = action['name'];
                }

                return state;
            };
            ngRedux.configureStore(draftReducer, createState(), [], [ freezeState() ]);
            const before = ngRedux.getState();

            ngRedux.dispatch({ type: 'RENAME', name: 'Bob' });

            expect(ngRedux.getState().user.name).toBe('Bob');
            expect(before.user.name).toBe('Ada');
            expect(Object.isFrozen(ngRedux.getState().user)).toBe(true);
        });
    });
});
