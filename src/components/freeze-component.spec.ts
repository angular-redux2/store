/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction } from 'redux';

/**
 * Imports
 */

import { createStore } from 'redux';
import { draft } from './draft.component';
import { deepFreeze, freezeReducer } from './freeze.component';

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

describe('deepFreeze', () => {
    test('should freeze the value with its nested objects and arrays and return it', () => {
        const state = createState();

        expect(deepFreeze(state)).toBe(state);
        expect(Object.isFrozen(state)).toBe(true);
        expect(Object.isFrozen(state.user)).toBe(true);
        expect(Object.isFrozen(state.user.tags)).toBe(true);
    });

    test.each(
        { case: 'a Date', key: 'joined' },
        { case: 'a Map', key: 'lookup' },
        { case: 'a class instance', key: 'point' }
    )('should leave $case unfrozen, so its methods and fields keep working', ({ key }: any) => {
        const state = deepFreeze(createState());

        expect(Object.isFrozen(state[key])).toBe(false);
    });

    test('should stop at an object that is already frozen', () => {
        const child = { value: 1 };
        const state = deepFreeze({ frozen: Object.freeze({ child }) });

        expect(Object.isFrozen(state)).toBe(true);
        expect(Object.isFrozen(child)).toBe(false);
    });

    test.each(
        { case: 'undefined', value: undefined },
        { case: 'null', value: null },
        { case: 'a number', value: 1 },
        { case: 'a string', value: 'a' }
    )('should return $case as it is', ({ value }) => {
        expect(deepFreeze(value)).toBe(value);
    });
});

describe('freezeReducer', () => {
    test('should freeze the state that the store starts with', () => {
        const store = createStore(freezeReducer(reducer));

        expect(Object.isFrozen(store.getState())).toBe(true);
        expect(Object.isFrozen(store.getState().user.tags)).toBe(true);
    });

    test('should freeze each state that the reducer returns', () => {
        const store = createStore(freezeReducer(reducer));
        store.dispatch({ type: 'RENAME', name: 'Bob' });

        expect(Object.isFrozen(store.getState().user)).toBe(true);
        expect(() => {
            store.getState().user.name = 'Eve';
        }).toThrow(TypeError);
    });

    test('should make a reducer that mutates its state throw', () => {
        const mutating = (state: any = createState(), action: UnknownAction): any => {
            if (action.type === 'RENAME') state.user.name = action['name'];

            return state;
        };
        const store = createStore(freezeReducer(mutating));

        expect(() => store.dispatch({ type: 'RENAME', name: 'Bob' })).toThrow(TypeError);
    });

    test('should let a draft reducer write to its draft of a frozen state', () => {
        const renaming = draft(createState(), (state: any, action: UnknownAction) => {
            if (action.type === 'RENAME') state.user.name = action['name'];
        });
        const store = createStore(freezeReducer(renaming));
        const before = store.getState();

        store.dispatch({ type: 'RENAME', name: 'Bob' });

        expect(store.getState().user.name).toBe('Bob');
        expect(before.user.name).toBe('Ada');
        expect(Object.isFrozen(store.getState().user)).toBe(true);
    });
});
