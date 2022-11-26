/**
 * Import third-party libraries
 */

import { AnyAction } from 'redux';

/**
 * Decorator's
 */

import { Action } from './action.decorator';

/**
 * Initialize global test invariant variable
 */

interface BugPayload {
    name: string;
    active?: boolean;
    assign?: string;
}

class TestReducer {
    @Action
    addBug(state: Array<BugPayload>, action: AnyAction): Array<BugPayload> {
        const payload: BugPayload = action['payload'];
        return [ payload ];
    }
}

/**
 * Test auto generate action struct.
 */

test('Should return action object that generate from addBug method.', () => {
    new TestReducer();
    const result = (TestReducer as any).actions['addBug']();
    const resultPayload = (TestReducer as any).actions['addBug']({ test: 'test'});

    expect(resultPayload).toStrictEqual({
        type: 'TestReducer/addBug',
        payload: { test: 'test'}
    });

    expect(result).toStrictEqual({
        type: 'TestReducer/addBug'
    })
});
