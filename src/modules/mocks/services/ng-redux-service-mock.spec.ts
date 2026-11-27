/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction } from 'redux';

/**
 * Imports
 */

import { MockNgRedux } from './ng-redux.service.mock';

/**
 * Tests
 */

interface StateInterface {
    counter: number;
    users: Record<string, { loc: number }>;
}

const INITIAL_STATE: StateInterface = { counter: 0, users: { bob: { loc: 1 } } };

function locReducer(state = { loc: 0 }, action: UnknownAction): { loc: number } {
    return action.type === 'ADD_LOC' ? { loc: state.loc + 1 } : state;
}

describe('MockNgRedux', () => {
    test('should start from the given state', () => {
        expect(new MockNgRedux(INITIAL_STATE).getState()).toBe(INITIAL_STATE);
    });

    test('should start from undefined without a state', () => {
        expect(new MockNgRedux().getState()).toBeUndefined();
    });

    describe('dispatch', () => {
        test('should record the action and leave the state alone', () => {
            const store = new MockNgRedux(INITIAL_STATE);

            expect(store.dispatch({ type: 'INCREMENT' })).toEqual({ type: 'INCREMENT' });
            expect(store.dispatched).toEqual([{ type: 'INCREMENT' }]);
            expect(store.getState()).toBe(INITIAL_STATE);
        });

        test('should record a substore action with its route and leave the state alone', () => {
            const store = new MockNgRedux(INITIAL_STATE);
            store.substore([ 'users', 'bob' ], locReducer).dispatch({ type: 'ADD_LOC' });

            expect(store.dispatched).toEqual([ expect.objectContaining({ type: 'ADD_LOC' }) ]);
            expect(store.getState()).toBe(INITIAL_STATE);
        });
    });

    describe('setState', () => {
        test('should replace the state and update the selections', () => {
            const store = new MockNgRedux(INITIAL_STATE);
            const count = store.select(state => state.counter);

            store.setState({ counter: 5, users: {} });

            expect(count()).toBe(5);
            expect(store.dispatched).toEqual([]);
        });

        test('should emit the change to select$ subscribers synchronously', () => {
            const store = new MockNgRedux(INITIAL_STATE);
            const values: Array<number> = [];
            store.select$(state => state.counter).subscribe(value => values.push(value));

            store.setState({ ...INITIAL_STATE, counter: 2 });

            expect(values).toEqual([ 0, 2 ]);
        });

        test('should update a substore selection', () => {
            const store = new MockNgRedux(INITIAL_STATE);
            const loc = store.substore<{ loc: number }>([ 'users', 'bob' ], locReducer).select(user => user.loc);

            store.setState({ counter: 0, users: { bob: { loc: 9 } } });

            expect(loc()).toBe(9);
        });

        test('should set the key of a feature reducer', () => {
            const store = new MockNgRedux<StateInterface & { todos?: Array<string> }>(INITIAL_STATE);
            store.addReducer('todos', (state: Array<string> = []) => state);

            store.patchState({ todos: [ 'set' ] });

            expect(store.getState().todos).toEqual([ 'set' ]);
            expect(store.getState().counter).toBe(0);
        });
    });

    test('should merge a patch into the current state', () => {
        const store = new MockNgRedux(INITIAL_STATE);
        store.patchState({ counter: 3 });

        expect(store.getState()).toEqual({ counter: 3, users: { bob: { loc: 1 } } });
    });

    test('should clear the recorded actions and return to the starting state on reset', () => {
        const store = new MockNgRedux(INITIAL_STATE);
        store.dispatch({ type: 'INCREMENT' });
        store.patchState({ counter: 3 });

        store.reset();

        expect(store.dispatched).toEqual([]);
        expect(store.getState()).toBe(INITIAL_STATE);
    });
});
