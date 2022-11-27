/**
 * Import third-party libraries
 */

import { AnyAction } from "redux";

/**
 * Services
 */

import { ReducerService } from './reducer.service';
import { ACTION_KEY } from "../interfaces/fractal.interface";
import { RECEIVE_INIT_STATE } from "../interfaces/sync.interface";

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
    }

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
        const customReducer = jest.fn();
        const action = {
            type: 'test',
            [ACTION_KEY]: {
                hash: 1,
                path: [ 'users', 'danielle' ]
            }
        };

        (reducerService as any).map = { 1: customReducer };
        reducerService.rootReducer(state, action);

        expect(customReducer).toBeCalledWith(state['users']['danielle'], action);
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
    }

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

    test('Should create new state in with js proxy on return state.', () => {
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
});
