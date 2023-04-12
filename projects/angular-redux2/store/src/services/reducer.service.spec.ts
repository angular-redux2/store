/**
 * Angular-redux
 */

import { ReducerService } from "./reducer.service";

let reducerService: ReducerService;

beforeEach(() => {
    // Create a new instance of the ReducerService class before each test
    reducerService = ReducerService.getInstance();
});

describe('getInstance', () => {
    it('should return the same instance of the ReducerService class', () => {
        const instance1 = ReducerService.getInstance();
        const instance2 = ReducerService.getInstance();
        expect(instance1).toBe(instance2);
    });
});

describe('composeReducers', () => {
    test('should return a new reducer function that applies the middleware chain to the root reducer', () => {
        // Define a root reducer and middleware functions
        const rootReducer = (state: any, action: any) => state;
        const middleware1 = (state: any, action: any, next: any) => next(state);
        const middleware2 = (state: any, action: any, next: any) => next(state);

        // Compose the reducers and middleware functions
        const composedReducer = reducerService.composeReducers(rootReducer, [ middleware1, middleware2 ]);

        // Assert that the composed reducer returns the expected value
        const state = { foo: 'bar' };
        const action = { type: 'TEST_ACTION' };
        expect(composedReducer(state, action)).toEqual(state);
    });
});

describe('replaceReducer', () => {
    test('should replace the root reducer with a new reducer function', () => {
        const nextReducer = (state: any, action: any) => state;

        reducerService.replaceReducer(nextReducer);

        expect(reducerService['rootReducer']).toEqual(nextReducer);
    });
});

describe('executeMiddlewareChain', () => {
    test('should execute the middleware chain for the current action and return the new state', () => {
        // Define a state and action object
        const state = { foo: 'bar' };
        const action = { type: 'TEST_ACTION' };

        // Define middleware functions
        const middleware1 = jest.fn((state: any, action: any, next: any) => next(state));
        const middleware2 = jest.fn((state: any, action: any, next: any) => next(state));
        const middleware3 = jest.fn((state: any, action: any, next: any) => next(state));

        // Register the middleware functions with the reducer service
        const fn = reducerService.composeReducers((state: any) => state, [ middleware1, middleware2, middleware3 ]);

        // Execute the middleware chain
        fn(state, action);

        // Assert that each middleware function was called with the correct arguments
        expect(middleware1).toHaveBeenCalledWith(state, action, expect.any(Function));
        expect(middleware2).toHaveBeenCalledWith(state, action, expect.any(Function));
        expect(middleware3).toHaveBeenCalledWith(state, action, expect.any(Function));
    });

    test('should return the state if there are no middleware functions to execute', () => {
        // Define a state and action object
        const state = { foo: 'bar' };
        const action = { type: 'TEST_ACTION' };

        // Define a root reducer that simply returns the state
        const rootReducer = (state: any) => state;

        // Compose the reducers and middleware functions
        const composedReducer = reducerService.composeReducers(rootReducer, []);

        // Execute the middleware chain
        const newState = composedReducer(state, action);

        // Assert that the new state is the same as the original state
        expect(newState).toEqual(state);
    });
});

describe('cleanup', () => {
    test('should recursively remove all proxy-related properties from an object', () => {
        const obj = {
            prop1: {},
            prop2: {
                prop3: {
                    prop4: {},
                },
            },
            prop5: {},
        };

        // @ts-ignore
        const cleanedObj = reducerService.cleanup(obj);

        expect(cleanedObj.prop1).toEqual({});
        expect(cleanedObj.prop2.prop3.prop4).toEqual({});
        expect(cleanedObj.prop5).toEqual({});
    });
});

describe('produce', () => {
    test('should produce a new state object based on the given base state object and an action object', () => {
        const state = {
            prop1: {},
            prop2: {},
        };
        const action = {};
        const producer = (state: any, action: any) => state;

        // @ts-ignore
        const newState = reducerService.produce(state, action, producer);

        expect(newState).toEqual(state);
    });

    test('should return the cleaned up state object after modifications have been made', () => {
        const state = {
            counter: 0,
            items: [ 'apple', 'banana', 'orange' ]
        };

        const incrementCounter = (state: any) => {
            state.counter += 1;
        };

        // @ts-ignore
        const newState = reducerService.produce(state, {}, incrementCounter);

        expect(newState.counter).toBe(1);
        expect(newState.items).toEqual([ 'apple', 'banana', 'orange' ]);
    });

    test('should not modify the original state object', () => {
        const state = {
            counter: 0,
            items: [ 'apple', 'banana', 'orange' ]
        };

        const incrementCounter = (state: any) => {
            state.counter += 1;
        };

        // @ts-ignore
        reducerService.produce(state, {}, incrementCounter);

        expect(state.counter).toBe(0);
        expect(state.items).toEqual([ 'apple', 'banana', 'orange' ]);
    });
});


describe('Immutable state created by js proxy', () => {
    let state: any;

    beforeEach(() => {
        state = {
            loc: 'US',
            level1: {
                level2: {
                    name: 'test',
                },
            },
            categoriesGroups: [
                {
                    type: 'test',
                    visible: true,
                    categories: [ { name: 'phone' } ],
                },
                {
                    type: 'number',
                    visible: true,
                    categories: [ { name: 'phone' } ],
                },
            ],
        };
    });

    test('creates new state with js proxy', () => {
        const rootReducer = reducerService.composeReducers((state, action) => {
            state.loc += action['payload'];
            state.level1.level2.name = 'test new name';
        });
        const newState = rootReducer(state, { type: 'test', payload: 'test' });

        expect(newState).toEqual(expect.objectContaining({
            loc: expect.any(String),
            level1: expect.objectContaining({
                level2: expect.objectContaining({
                    name: 'test new name',
                }),
            }),
        }));
        expect(newState._isProxy).toBeUndefined();
    });

    test('creates new state by js proxy with return state', () => {
        const rootReducer = reducerService.composeReducers((state, action) => {
            state.loc = action['payload'];

            return state;
        });
        const newState = rootReducer(state, { type: 'test', payload: 'test' });

        expect(newState).toEqual(expect.objectContaining({
            loc: 'test',
        }));
        expect(newState._isProxy).toBeUndefined();
    });

    test('removes js proxy on spread operator', () => {
        const rootReducer = reducerService.composeReducers((state, action) => {
            const copyState = { ...state };
            copyState.level1.level2.name = 'test new name';

            return copyState;
        });
        const newState = rootReducer(state, { type: 'test', payload: 'test' });

        expect(newState).toEqual(expect.objectContaining({
            level1: expect.objectContaining({
                level2: expect.objectContaining({
                    name: 'test new name',
                }),
            }),
        }));
        expect(newState.level1._isProxy).toBeUndefined();
    });

    test('Should create new state old way.', () => {
        const rootReducer = reducerService.composeReducers((state: any, action: any) => {
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
});

describe('Complex nested object with js proxy', () => {
    test('Should create new state with complex nested object by js proxy with return state.', () => {
        const state = {
            users: [
                {
                    name: 'John',
                    age: 28,
                    address: {
                        street: '123 Main St',
                        city: 'Anytown',
                        state: 'CA',
                        zip: '12345'
                    }
                },
                {
                    name: 'Jane',
                    age: 32,
                    address: {
                        street: '456 Oak St',
                        city: 'Othertown',
                        state: 'CA',
                        zip: '67890'
                    }
                }
            ]
        };

        const rootReducer = reducerService.composeReducers((state, action) => {
            const users = state.users;
            const index = users.findIndex((user: any) => user.name === action['payload'].name);

            if (index >= 0) {
                const user = users[index];
                user.address = { ...user.address, ...action['payload'].address };
            }

            return state;
        });

        const newState = rootReducer(state, {
            type: 'UPDATE_USER_ADDRESS',
            payload: {
                name: 'John',
                address: {
                    city: 'Newtown'
                }
            }
        });

        expect(newState).not.toBe(state);
        expect(newState.users[0].address.city).toBe('Newtown');
        expect(newState.users[0]._isProxy).toBeUndefined();
    });
});

describe('Utility function', () => {
    test('Should clean object from proxy rerun if is not an object.', () => {
        // @ts-ignore
        const result = reducerService.cleanup('test');

        expect(result).toBe('test');
    });
});

