/**
 * angular-redux2
 */

import { Action } from '../../decorators/action.decorator';
import { AbstractReducer } from '../../abstract/reducer.abstract';

/**
 * angular-redux2 types
 */

import { ActionCreator, ReducerActions } from '../../interfaces/store.interface';

interface Bug {
    name: string;
    active?: boolean;
    assign?: string;
}

class TestReducer extends AbstractReducer {
    /**
     * Action types
     */

    static override actions: ReducerActions<TestReducer>;

    @Action
    addBug(state: Bug[], payload: ActionCreator<Bug>): Bug[] {
        return [ ...state, payload ];
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
    const reducer = TestReducer.createReducer<Bug[]>([{ name: 'name' }]);

    beforeAll(() => {
        addBugSpy = jest.spyOn(TestReducer.prototype, 'addBug');
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test('Access to method in reducer class by action.', () => {
        TestReducer.actions;

        reducer([{ name: 'x' }], TestReducer.actions.addBug(<any>{
            assign: 'test'
        }));

        expect(addBugSpy).toBeCalledWith([{ name: 'x' }], {
            assign: 'test'
        });
    });
});
