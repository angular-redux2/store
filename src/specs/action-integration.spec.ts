/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { ActionCreatorType, ReducerActionsType } from '@interfaces/store.interface';

/**
 * Imports
 */

import { Action } from '@decorators/action.decorator';
import { AbstractReducer } from '@abstract/reducer.abstract';

interface BugInterface {
    name: string;
    active?: boolean;
    assign?: string;
}

class TestReducer extends AbstractReducer {
    /**
     * Action types
     */

    static override actions: ReducerActionsType<TestReducer>;

    @Action
    addBug(state: BugInterface[], payload: ActionCreatorType<BugInterface>): BugInterface[] {
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
    const reducer = TestReducer.createReducer<BugInterface[]>([{ name: 'name' }]);

    beforeAll(() => {
        addBugSpy = xJet.spyOn(TestReducer.prototype, 'addBug');
    });

    afterAll(() => {
        xJet.restoreAllMocks();
    });

    test('Access to method in reducer class by action.', () => {
        reducer([{ name: 'x' }], TestReducer.actions.addBug(<any>{
            assign: 'test'
        }));

        expect(addBugSpy).toHaveBeenCalledWith([{ name: 'x' }], {
            assign: 'test'
        });
    });
});
