/**
 * Imports
 */

import { types } from 'util';
import { createAction, createSlice } from '@components/slice.component';

/**
 * Tests
 */

interface TodoInterface {
    title: string;
    done: boolean;
}

function createTodos() {
    return createSlice('todos', <Array<TodoInterface>> [], {
        add(state, title: string) {
            state.push({ title, done: false });
        },
        toggle(state, index: number) {
            state[index].done = !state[index].done;
        },
        clear() {
            return [];
        }
    });
}

describe('createAction', () => {
    test.each(
        { case: 'a payload', payload: 'x', expected: { type: 'ADD', payload: 'x' } },
        { case: 'a falsy payload such as 0', payload: 0, expected: { type: 'ADD', payload: 0 } },
        { case: 'no payload', payload: undefined, expected: { type: 'ADD' } }
    )('should build the action for $case', ({ payload, expected }: any) => {
        expect(createAction<unknown>('ADD')(payload)).toEqual(expected);
    });

    test('should build an action without a payload from a creator that takes no argument', () => {
        expect(createAction('RESET')()).toEqual({ type: 'RESET' });
    });
});

describe('createSlice', () => {
    test('should keep the name of the slice', () => {
        expect(createTodos().name).toBe('todos');
    });

    test('should build one action creator per handler, under the name', () => {
        const { actions } = createTodos();

        expect(actions.add('Write docs')).toEqual({ type: 'todos/add', payload: 'Write docs' });
        expect(actions.clear()).toEqual({ type: 'todos/clear' });
    });

    test('should start from the initial state', () => {
        expect(createTodos().reducer(undefined, { type: '@@INIT' })).toEqual([]);
    });

    test('should run the handler on a draft and leave the previous state as it was', () => {
        const { reducer, actions } = createTodos();
        const first = reducer([], actions.add('a'));
        const second = reducer(first, actions.toggle(0));

        expect(first).toEqual([{ title: 'a', done: false }]);
        expect(second).toEqual([{ title: 'a', done: true }]);
        expect(types.isProxy(second[0])).toBe(false);
    });

    test('should use the state that a handler returns', () => {
        const { reducer, actions } = createTodos();

        expect(reducer([{ title: 'a', done: false }], actions.clear())).toEqual([]);
    });

    test('should run the handler for an action that createAction built with the same type', () => {
        const { reducer } = createTodos();

        expect(reducer([], createAction<string>('todos/add')('a'))).toEqual([{ title: 'a', done: false }]);
    });

    test.each(
        { case: 'another slice', type: 'other/add' },
        { case: 'a bare handler name', type: 'add' },
        { case: 'a name that is not a handler', type: 'todos/missing' },
        { case: 'an inherited property name', type: 'todos/toString' }
    )('should return the same state for $case', ({ type }: any) => {
        const state = [{ title: 'a', done: false }];

        expect(createTodos().reducer(state, { type })).toBe(state);
    });
});
