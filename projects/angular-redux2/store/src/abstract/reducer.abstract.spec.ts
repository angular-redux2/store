/**
 * Import third-party libraries
 */

import { AnyAction } from 'redux';

/**
 * Abstracts
 */

import { AbstractReducer } from './reducer.abstract';

/**
 * Interfaces
 */

import {  ActionsReducer } from '../interfaces/store.interface';

/**
 * Initialize global test invariant variable
 */

const state = [ { name: 'bug name' } ];
const payload = {
    name: 'payload test'
};

interface BugPayload {
    name: string;
    active?: boolean;
    assign?: string;
}

class TestReducer extends AbstractReducer {
    /**
     * Action types
     */
    static override actions: ActionsReducer<TestReducer>;

    addBug(state: Array<BugPayload>, action: AnyAction): Array<BugPayload> {
        const payload: BugPayload = action['payload'];
        return [ payload ];
    }
}

/**
 * Initialize global test mocks
 */

let addBugSpy = jest.spyOn(TestReducer.prototype, 'addBug');
let reducer = TestReducer.createReducer<Array<BugPayload>>([ { name: 'init state' } ]);

afterEach(() => {
    addBugSpy.mockReset();
});

test('Should call correct method in reducer class.', () => {
    reducer(state, {
        type: 'addBug',
        payload: payload
    });

    expect(addBugSpy).toBeCalledWith(state, payload);
});

test('Should call correct method with namespace in reducer class.', () => {
    reducer(state, {
        type: 'TestReducer/addBug',
        payload: payload
    });

    expect(addBugSpy).toBeCalledWith(state, payload);
});

test('Should get new state from reducer method.', () => {
    const stateMock = [{
        name: 'test new state.'
    }];

    addBugSpy.mockReturnValueOnce(stateMock);
    const result = reducer(state, {
        type: 'addBug',
    });

    expect(result).toStrictEqual(stateMock);
});

test('Should return same state when method is not exists.', () => {
    const result = reducer(state, {
        type: 'undefinedTest',
    });

    expect(result).toStrictEqual(state);
});
