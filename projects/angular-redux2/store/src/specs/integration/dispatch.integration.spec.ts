/**
 * Import third-party libraries
 */

import { NgZone } from '@angular/core';
import { Reducer, Action, AnyAction } from 'redux';

/**
 * Services
 */

import { NgRedux } from '../../services/ng-redux.service';

/**
 * Decorator's
 */

import { Substore } from '../../decorators/substore.decorator';

/**
 * Interfaces
 */

import { ACTION_KEY } from "../../interfaces/fractal.interface";
import { Dispatch } from "../../decorators/dispatch.decorator";

/**
 * Zone
 */

class MockNgZone extends NgZone {
    override run<T>(fn: (...args: any[]) => T): T {
        return fn() as T;
    }
}

/**
 * Initialize global test invariant variable
 */

interface IAppState {
    value: string;
    instanceProperty?: string;
}

type PayloadAction = Action & { payload?: IAppState };

/**
 * Initialize global test mocks
 */

let ngRedux;
let defaultState: IAppState;
let rootReducer: Reducer<IAppState, AnyAction>;
const mockNgZone = new MockNgZone({ enableLongStackTrace: false }) as NgZone;

/**
 * Before each test
 */

beforeEach(() => {
    /**
     * Init store
     */

    defaultState = {
        value: 'init-value',
        instanceProperty: 'init-instanceProperty',
    };

    /**
     * Root reducer
     */

    rootReducer = (state = defaultState, action: PayloadAction) => {
        switch (action.type) {
            case 'TEST':
                const { value = null, instanceProperty = null } =
                action.payload || {};
                return Object.assign({}, state, { value, instanceProperty });

            case 'CONDITIONAL_DISPATCH_TEST':
                return { ...state, ...action.payload };

            default:
                return state;
        }
    };

    ngRedux = new NgRedux<any>(mockNgZone);
    ngRedux.configureStore(rootReducer, defaultState);
    jest.spyOn(NgRedux.store, "dispatch");
});

describe('Should test root store dispatch.', () => {

    /**
     * Initialize scope test invariant variable
     */

    class TestClass {
        instanceProperty = 'test';

        @Dispatch
        externalFunction: (value: string) => PayloadAction;

        @Dispatch
        classMethod(value: string): PayloadAction {
            return {
                type: 'TEST',
                payload: { value, instanceProperty: this.instanceProperty },
            };
        }

        @Dispatch
        conditionalDispatchMethod(
            shouldDispatch: boolean
        ): PayloadAction | false {
            if (shouldDispatch) {
                return {
                    type: 'CONDITIONAL_DISPATCH_TEST',
                    payload: {
                        value: 'Conditional Dispatch Action',
                        instanceProperty: this.instanceProperty,
                    },
                };
            } else {
                return false;
            }
        }

        @Dispatch
        boundProperty = (value: string): PayloadAction => ({
            type: 'TEST',
            payload: { value, instanceProperty: this.instanceProperty },
        });
    }

    /**
     * Before each test
     */

    let instance: TestClass;

    beforeEach(() => {
        instance = new TestClass();
    });

    test('Should call dispatch with the result of the function.', () => {
        const result = instance.classMethod('class method');

        const expectedArgs = {
            type: 'TEST',
            payload: {
                value: 'class method',
                instanceProperty: 'test',
            },
        };

        expect(result.type).toBe('TEST');
        expect(result.payload && result.payload.value).toBe('class method');
        expect(result.payload && result.payload.instanceProperty).toBe('test');
        expect(NgRedux.store).toBeTruthy();
        expect(NgRedux.store.dispatch).toHaveBeenCalledWith(expectedArgs);
    });

    test('Should not call dispatch.', () => {
        const stateBeforeAction = NgRedux.store.getState();
        const result = instance.conditionalDispatchMethod(false);

        expect(result).toBe(false);
        expect(NgRedux.store).toBeTruthy();
        expect(NgRedux.store.getState()).toEqual(stateBeforeAction);
    });

    test('Should call dispatch with result of function normally.', () => {

        const result = <PayloadAction> instance.conditionalDispatchMethod(true);
        expect(result.type).toBe('CONDITIONAL_DISPATCH_TEST');
        expect(result.payload && result.payload.value).toBe(
            'Conditional Dispatch Action'
        );
        expect(result.payload && result.payload.instanceProperty).toBe('test');
        expect(NgRedux.store).toBeTruthy();
        expect(
            NgRedux.store.dispatch
        ).toHaveBeenCalledWith({
            type: 'CONDITIONAL_DISPATCH_TEST',
            payload: {
                value: 'Conditional Dispatch Action',
                instanceProperty: 'test',
            },
        });
    });

    test('Should work with property initializers.', () => {
        const result = instance.boundProperty('bound property');
        const expectedArgs = {
            type: 'TEST',
            payload: {
                value: 'bound property',
                instanceProperty: 'test',
            },
        };

        expect(result.type).toBe('TEST');
        expect(result.payload?.value).toBe('bound property');
        expect(result.payload?.instanceProperty).toBe('test');
        expect(NgRedux.store).toBeTruthy();
        expect(NgRedux.store.dispatch).toHaveBeenCalledWith(expectedArgs);
    });

    test('Should work with props bound to function defined outside of class.', () => {
        const instanceProperty = 'test';

        instance.externalFunction = (value: string) => {
            return {
                type: 'TEST',
                payload: {
                    value,
                    instanceProperty,
                },
            };
        }

        const result = instance.externalFunction('external function');
        const expectedArgs = {
            type: 'TEST',
            payload: {
                value: 'external function',
                instanceProperty: 'test',
            },
        };

        expect(result.type).toBe('TEST');
        expect(result.payload && result.payload.value).toBe('external function');
        expect(result.payload && result.payload.instanceProperty).toBe('test');
        expect(NgRedux.store).toBeTruthy();
        expect(NgRedux.store.dispatch).toHaveBeenCalledWith(expectedArgs);
    });
});

describe('Should test sub-store dispatch.', () => {

    /**
     * Initialize scope test invariant variable
     */

    const localReducer = (state: any, _: Action) => state;

    @Substore(localReducer)
    class TestClass {
        getBasePath = () => [ 'bar', 'foo' ];

        @Dispatch
        decoratedActionCreator(value: string): PayloadAction {
            return {
                type: 'TEST',
                payload: { value },
            };
        }
    }

    /**
     * Before each test
     */

    let instance: TestClass;

    beforeEach(() => {
        instance = new TestClass();
    });

    test('scopes decorated actions to the base path', () => {
        instance.decoratedActionCreator('hello');

        expect(NgRedux.store.dispatch).toHaveBeenCalledWith({
            type: 'TEST',
            payload: { value: 'hello' },
            [ACTION_KEY]: {
                "hash": -1216151093,
                "path": [
                    "bar",
                    "foo",
                ],
            },
        });
    });
});
