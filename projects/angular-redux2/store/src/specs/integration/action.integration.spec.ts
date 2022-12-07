/**
 * Import third-party libraries
 */

import { AnyAction } from 'redux';

/**
 * Abstracts
 */

import { AbstractReducer } from '../../abstract/reducer.abstract';

/**
 * Interfaces
 */

import { ActionPayload } from '../../interfaces/store.interface';

/**
 * Decorator's
 */

import { Action } from '../../decorators/action.decorator';

/**
 * Mock class reducer
 */

interface Bug {
    name: string;
    active?: boolean;
    assign?: string;
}

class TestReducer extends AbstractReducer {
    /**
     * Action types
     */

    static override actions: {
        addBug: ActionPayload<Bug>
    };

    @Action
    addBug(state: Array<Bug>, action: AnyAction): Array<Bug> {
        const payload: Bug = action['payload'];
        return [ payload ];
    }
}

/**
 * Test auto generate action struct.
 */

describe('Test auto generate action struct.', () => {
    /**
     * create Reducer wrap.
     */

    let addBugSpy: any;
    let reducer = TestReducer.createReducer<Array<Bug>>([ { name: 'x' } ]);

    beforeAll(() => {
        addBugSpy = jest.spyOn(TestReducer.prototype, 'addBug');
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test('Access to method in reducer class by action.', () => {
        reducer([ { name: 'y' } ], TestReducer.actions.addBug({
            name: 'x',
            assign: 'test'
        }));

        expect(addBugSpy).toBeCalledWith([ { name: 'y' } ], {
            name: 'x',
            assign: 'test'
        });
    });
});
