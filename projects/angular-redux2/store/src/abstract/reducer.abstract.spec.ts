/**
 * angular-redux2
 */

import { AbstractReducer } from './reducer.abstract';
import { Action } from '../decorators/action.decorator';

/**
 * Angular-redux2 types
 */

import { PayloadAction, ReducerActions } from '../interfaces/store.interface';

interface BugPayload {
    name: string;
    active?: boolean;
    assign?: string;
}

describe('AbstractReducer', () => {
    const initialState = [{ name: 'init state' }];
    const payload = { name: 'payload test' };

    class TestReducer extends AbstractReducer {
        static override actions: ReducerActions<TestReducer>;

        addBug(state: BugPayload[], action: PayloadAction): BugPayload[] {
            const payload: BugPayload = action.payload;

            return [ payload ];
        }
    }

    const addBugSpy = jest.spyOn(TestReducer.prototype, 'addBug');
    const reducer = TestReducer.createReducer<BugPayload[]>(initialState);

    beforeEach(() => {
        addBugSpy.mockReset();
    });

    describe('createReducer', () => {
        test('should return a reducer function that calls the method corresponding to the action type', () => {
            class TestReducer extends AbstractReducer {
                static override actions: any;

                @Action
                addBug(state: any, action: any) {
                    return { ...state, bugs: [ ...state.bugs, action ] };
                }
            }

            const reducer = TestReducer.createReducer({ bugs: [] });

            const initialState = { bugs: [] };
            const state = reducer(initialState, TestReducer.actions.addBug({ id: 1, description: 'Test bug' }));

            expect(state).toEqual({ bugs: [{ id: 1, description: 'Test bug' }] });
        });
    });

    describe('TestReducer', () => {
        test('should call the correct method in the reducer class', () => {
            reducer(initialState, { type: 'addBug', payload });

            expect(addBugSpy).toHaveBeenCalledWith(initialState, payload);
        });

        test('should call the correct method with namespace in the reducer class', () => {
            reducer(initialState, { type: 'TestReducer/addBug', payload });

            expect(addBugSpy).toHaveBeenCalledWith(initialState, payload);
        });

        test('should get a new state from the reducer method', () => {
            const newState = [{ name: 'test new state.' }];

            addBugSpy.mockReturnValueOnce(newState);

            const result = reducer(initialState, { type: 'addBug' });

            expect(result).toStrictEqual(newState);
        });

        test('should return the same state when the method does not exist', () => {
            const result = reducer(initialState, { type: 'undefinedTest' });

            expect(result).toStrictEqual(initialState);
        });
    });
});
