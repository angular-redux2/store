/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { PayloadActionInterface, ReducerActionsType } from '@interfaces/store.interface';

/**
 * Imports
 */

import { Action } from '@decorators/action.decorator';
import { AbstractReducer } from '@abstract/reducer.abstract';

interface BugPayloadInterface {
    name: string;
    active?: boolean;
    assign?: string;
}

describe('AbstractReducer', () => {
    const initialState = [{ name: 'init state' }];
    const payload = { name: 'payload test' };

    class TestReducer extends AbstractReducer {
        static override actions: ReducerActionsType<TestReducer>;

        @Action
        addBug(state: BugPayloadInterface[], action: PayloadActionInterface): BugPayloadInterface[] {
            const payload = <BugPayloadInterface> action.payload;

            return [ payload ];
        }
    }

    const addBugSpy = xJet.spyOn(TestReducer.prototype, 'addBug');
    const reducer = TestReducer.createReducer<BugPayloadInterface[]>(initialState);

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
        test('should call the method of a namespaced action type', () => {
            reducer(initialState, { type: 'TestReducer/addBug', payload });

            expect(addBugSpy).toHaveBeenCalledWith(initialState, payload);
        });

        test('should get a new state from the reducer method', () => {
            const newState = [{ name: 'test new state.' }];

            addBugSpy.mockReturnValueOnce(newState);

            const result = reducer(initialState, { type: 'TestReducer/addBug' });

            expect(result).toEqual(newState);
        });

        test('should leave the state alone for a bare type that matches a method name', () => {
            const result = reducer(initialState, { type: 'addBug', payload });

            expect(addBugSpy).not.toHaveBeenCalled();
            expect(result).toBe(initialState);
        });

        test.each(
            { case: 'a method that does not exist', type: 'TestReducer/undefinedTest' },
            { case: 'the constructor', type: 'TestReducer/constructor' },
            { case: 'an inherited Object method', type: 'TestReducer/toString' }
        )('should return the same state for $case', ({ type }) => {
            expect(reducer(initialState, { type })).toBe(initialState);
        });
    });

    describe('namespace', () => {
        test('should prefix the action types with the static namespace instead of the class name', () => {
            class AuthReducer extends AbstractReducer {
                static override namespace = 'auth';
                static override actions: ReducerActionsType<AuthReducer>;

                @Action
                login(state: { name: string }, name: string): { name: string } {
                    return { ...state, name };
                }
            }

            const authReducer = AuthReducer.createReducer({ name: '' });
            const action = AuthReducer.actions.login('ada');

            expect(action).toEqual({ type: 'auth/login', payload: 'ada' });
            expect(authReducer(undefined, action)).toEqual({ name: 'ada' });
            expect(authReducer(undefined, { type: 'AuthReducer/login', payload: 'ada' })).toEqual({ name: '' });
        });
    });

    describe('actions', () => {
        test('should keep the creators of two reducer classes apart', () => {
            class FirstReducer extends AbstractReducer {
                @Action
                reset(): number {
                    return 1;
                }
            }

            class SecondReducer extends AbstractReducer {
                @Action
                reset(): number {
                    return 2;
                }
            }

            expect(FirstReducer.actions['reset']()).toEqual({ type: 'FirstReducer/reset' });
            expect(SecondReducer.actions['reset']()).toEqual({ type: 'SecondReducer/reset' });
            expect(AbstractReducer.actions).toEqual({});
        });
    });
});
