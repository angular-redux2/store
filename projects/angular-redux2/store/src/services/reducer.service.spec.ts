/**
 * Import third-party libraries
 */

import { AnyAction } from 'redux';

/**
 * Services
 */

import { ReducerService } from './reducer.service';
import { ACTION_KEY } from '../interfaces/fractal.interface';
import { RECEIVE_INIT_STATE } from '../interfaces/sync.interface';

/**
 * Initialize Global test invariant variable
 */

let reducerService: ReducerService;

beforeEach(() => {
    jest.restoreAllMocks();
    reducerService = ReducerService.getInstance();
    (reducerService as any).map = {};
});

describe('Reducer-Service functional', () => {
    /**
     * Initialize local test invariant variable
     */

    const state = {
        users: {
            danielle: {
                name: 'Danielle Reed',
                occupation: 'Programmer',
                loc: 1023,
            },
            lise: {
                name: 'Beth Lewis',
                occupation: 'DevOps Specialist',
                loc: 2314,
            }
        }
    };

    test('Should root reducer not crush.', () => {
        const action: AnyAction = {
            type: 'test',
            '@angular-redux2::fractalKey': ''
        };

        expect(reducerService.rootReducer(state, action)).toStrictEqual(state);
    });

    test('Should root reducer return new state from sync message.', () => {
        const action: AnyAction = {
            type: RECEIVE_INIT_STATE,
            payload: {
                name: 'test'
            }
        };

        expect(reducerService.rootReducer(state, action)).toStrictEqual({ name: 'test' });
    });

    test('Should redirect to custom reducer.', () => {
        const action = {
            type: 'test',
            [ACTION_KEY]: {
                hash: 1,
                path: [ 'users', 'danielle' ]
            }
        };

        const customReducer = jest.fn((localState: any, localAction: any) => {
            expect(localAction).toStrictEqual(action);
            expect(localState).toStrictEqual(state['users']['danielle']);

            localState.loc = 1234;
        });

        (reducerService as any).map = { 1: customReducer };
        const newState: any = reducerService.rootReducer(state, action);

        expect(customReducer).toBeCalled();
        expect(newState['users']['danielle']['loc']).toStrictEqual(1234);
        expect(state['users']['danielle']['loc']).toStrictEqual(1023);
    });

    test('Should replace reducer.', () => {
        const testReducer = () => {
        };
        const map = (reducerService as any).map;
        map[1234] = 'test';
        reducerService.replaceReducer(1234, testReducer);

        expect(map[1234]).toStrictEqual(testReducer);
    });

    test('Should register new reducer', () => {
        const testReducer = () => {
        };
        const map = (reducerService as any).map;
        reducerService.registerReducer(4321, testReducer);

        expect(map[4321]).toStrictEqual(testReducer);
    });
});

describe('Should test immutable state create by js proxy.', () => {
    /**
     * Initialize local test invariant variable
     */

    const state: any = {
        loc: 'US',
        level1: {
            level2: {
                name: 'test'
            }
        }
    };

    test('Should create new state with js proxy.', () => {
        const rootReducer = reducerService.composeRoot((state: any, action: any) => {
            state.loc = state.loc + action.payload;
            state.level1.level2.name = 'test new name';
        });
        const newState = rootReducer(state, { type: 'test', payload: 'test' });

        expect(state).not.toStrictEqual(newState);
        expect(state.level1.level2.name).toStrictEqual('test');
        expect(newState.level1.level2.name).toStrictEqual('test new name');
        expect(newState._isProxy).toBe(undefined);
    });

    test('Should create new state by js proxy with return state.', () => {
        const rootReducer = reducerService.composeRoot((state: any, action: any) => {
            state.loc = action.payload;

            return state;
        });
        const newState = rootReducer(state, { type: 'test', payload: 'test' });

        expect(state).not.toStrictEqual(newState);
        expect(state.loc).toStrictEqual('US');
        expect(newState.loc).toStrictEqual('test');
        expect(newState._isProxy).toBe(undefined);
    });

    test('Should remove js proxy on spread operator.', () => {
        const rootReducer = reducerService.composeRoot((state: any, action: any) => {
            const copyState = { ...state };
            copyState.level1.level2.name = 'test new name';

            return copyState;
        });
        const newState = rootReducer(state, { type: 'test', payload: 'test' });

        expect(state).not.toStrictEqual(newState);
        expect(state.level1.level2.name).toStrictEqual('test');
        expect(newState.level1.level2.name).toStrictEqual('test new name');
        expect(newState.level1._isProxy).toBe(undefined);
    });

    test('Should create new state old way.', () => {
        const rootReducer = reducerService.composeRoot((state: any, action: any) => {
            const copyState = { ...state };
            copyState.level1 = { ...copyState.level1 };
            copyState.level1.name = 'test';

            return copyState;
        });
        const newState = rootReducer(state, { type: 'test', payload: 'test' });

        expect(state).not.toStrictEqual(newState);
        expect(state.level1.name).toStrictEqual(undefined);
        expect(newState.level1.name).toStrictEqual('test');
        expect(newState.level1._isProxy).toBe(undefined);
    });

    test('Should clean object from proxy rerun if is not an object.', () => {
        const result = (reducerService as any).clean('test');

        expect(result).toBe('test');
    });

    test('Should create new state with complex nested object by js proxy with return state.', () => {
        const localState: any = {
            categoriesGroups: [
                {
                    type: 'test',
                    visible: true,
                    categories: [ {
                        name: 'phone'
                    } ]
                },
                {
                    type: 'number',
                    visible: true,
                    categories: [ {
                        name: 'phone'
                    } ]
                }
            ]
        };


        const rootReducer = reducerService.composeRoot((state: any, action: any) => {
            let groups = state.categoriesGroups;
            let group = groups.find((g: any) => g.type === action.payload.groupType);
            let categoryIndex = group.categories.indexOf(group.categories.find((c: any) => c.name === action.payload.categoryName));
            group.categories.splice(categoryIndex, 1);

            return state;
        });

        const newState = rootReducer(localState, {
            type: 'test', payload: {
                groupType: 'number',
                categoryName: 'phone'
            }
        });

        expect(localState).not.toStrictEqual(newState);
        expect(localState.categoriesGroups[1].categories.length).toStrictEqual(1);
        expect(newState.categoriesGroups[1].categories.length).toStrictEqual(0);
        expect(newState._isProxy).toBe(undefined);
    });
});
