/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Reducer, Store, StoreEnhancer } from 'redux';
import type { MiddlewareInterface } from '@interfaces/reducer.interface';

/**
 * Imports
 */

import { of } from 'rxjs';
import { NgZone } from '@angular/core';
import { ReducerService } from '@services/reducer.service';
import { SubStoreService } from '@services/sub-store.service';
import { combineReducers, compose, createStore } from 'redux';
import { NgRedux, ADD_REDUCER } from '@services/ng-redux.service';

describe('NgRedux', () => {
    let ngRedux: NgRedux<object>;
    let mockReduxCompose: ReturnType<typeof xJet.fn>;

    beforeEach(() => {
        ngRedux = new NgRedux<object>();
        mockReduxCompose = xJet.fn().mockReturnValue(createStore);
    });

    afterEach(() => {
        xJet.resetAllMocks();
    });

    describe('store', () => {
        test('should throw an error if instance is not initialized', () => {
            // Arrange
            (NgRedux as any).instance = undefined;

            // Act & Assert
            expect(() => NgRedux.store).toThrow('NgRedux failed: instance not initialize.');
        });

        test('should return the instance of NgRedux if it is initialized', () => {
            // Arrange
            (NgRedux as any).instance = ngRedux;

            // Act
            const result = NgRedux.store;

            // Assert
            expect(result).toEqual(ngRedux);
        });
    });

    describe('configureStore', () => {
        const reducer: Reducer = (state = {}) => state;
        const initState = {};
        const middleware: Array<MiddlewareInterface<object>> = [];
        const enhancers: StoreEnhancer[] = [];

        test('should throw an error if store is already initialized', () => {
            // Arrange
            ngRedux['reduxStore'] = {} as any; // set the private reduxStore property to an object

            // Act and assert
            expect(() => ngRedux.configureStore(reducer, initState, middleware, enhancers)).toThrow(
                'Store already initialize!'
            );
        });

        test('should call setStore with the created store', () => {
            // Arrange
            const setStoreSpy = xJet.spyOn(ngRedux as any, 'setStore');
            const expectedStore = {} as any;

            xJet.spyOn(ReducerService.getInstance(), 'composeReducers').mockReturnValue(() => expectedStore);
            xJet.mock(compose).mockReturnValue(<any> mockReduxCompose);

            // Act
            ngRedux.configureStore(reducer, initState, middleware, enhancers);

            // Assert
            expect(mockReduxCompose).toHaveBeenCalledWith(createStore);
            expect(ReducerService.getInstance().composeReducers).toHaveBeenCalledWith(reducer, middleware, expect.any(Map));
            expect(setStoreSpy).toHaveBeenCalled();
        });
    });

    describe('configureSubStore', () => {
        test('should create a new SubStoreService instance', () => {
            const reducer = (state: object = {}): object => state;
            const initState = {};

            xJet.spyOn(ReducerService.getInstance(), 'composeReducers').mockReturnValue(() => initState);

            ngRedux.configureStore(reducer, initState);

            const subStore = ngRedux.configureSubStore([ 'path' ], reducer);
            expect(subStore).toBeInstanceOf(SubStoreService);
        });
    });

    describe('provideStore', () => {
        let spyReplaceReducer: any;
        const reducer = (state: object = {}): object => state;

        beforeEach(() => {
            spyReplaceReducer = xJet.spyOn(
                ReducerService.getInstance(),
                'composeReducers'
            ).mockReturnValueOnce(reducer);
        });

        test('should replace the store reducer and initialize the store', () => {
            const store = createStore(reducer);

            const mockReplaceReducer = xJet.spyOn(
                store,
                'replaceReducer'
            );

            ngRedux.provideStore(reducer, store);

            expect(spyReplaceReducer).toHaveBeenCalledWith(reducer, [], expect.any(Map));
            expect(mockReplaceReducer).toHaveBeenCalled();
            expect(ngRedux['reduxStore']).toBe(store);
        });

        test('should throw an error if the store is already initialized', () => {
            const store = createStore(reducer);
            ngRedux.provideStore(reducer, store);

            expect(() => ngRedux.provideStore(reducer, store)).toThrow('Store already initialize!');
        });
    });

    describe('getState', () => {
        test('should call getState on the store and return the state', () => {
            const expectedState = { count: 0 };
            (ngRedux as any).reduxStore = {
                getState: xJet.fn().mockReturnValueOnce(expectedState)
            };

            const result = ngRedux.getState();

            expect((ngRedux as any).reduxStore.getState).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedState);
        });
    });

    describe('dispatch', () => {
        let store: Store<any, any>;
        const reducer = (state: object = {}): object => state;

        beforeEach(() => {
            xJet.spyOn(
                ReducerService.getInstance(),
                'composeReducers'
            ).mockReturnValueOnce(reducer);

            store = createStore(() => ({}));
            ngRedux.provideStore(() => ({}), store);
        });

        test('dispatches an action to the store', () => {
            const action = { type: 'TEST_ACTION' };
            const dispatchSpy = xJet.spyOn(store, 'dispatch');

            ngRedux.dispatch(action);

            expect(dispatchSpy).toHaveBeenCalledWith(action);
        });

        test('throws an error when the store is not initialized', () => {
            ngRedux = new NgRedux<object>(); // initialize without store
            const action = { type: 'TEST_ACTION' };

            expect(() => ngRedux.dispatch(action)).toThrow('Dispatch failed: store instance not initialize.');
        });

        test('runs the dispatch inside NgZone if it exists and is outside the zone', () => {
            const action = { type: 'TEST_ACTION' };
            const dispatchSpy = xJet.spyOn(store, 'dispatch');
            const runMock = xJet.fn((callback: any) => {
                callback();
            });

            (ngRedux as any).ngZone = { run: runMock } as any;
            NgZone.isInAngularZone = xJet.fn(() => false);

            ngRedux.dispatch(action);

            expect(runMock).toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalledWith(action);
        });
    });

    describe('subscribe', () => {
        test('should subscribe a listener to the store', () => {
            const mockListener = xJet.fn();
            const mockUnsubscribe = xJet.fn();
            const mockStore = {
                getState: xJet.fn().mockReturnValue({}),
                subscribe: xJet.fn(() => mockUnsubscribe)
            };

            (ngRedux as any).setStore(mockStore as any);

            const result = ngRedux.subscribe(mockListener);

            expect(result).toBe(mockUnsubscribe);
            expect(mockStore.subscribe).toHaveBeenCalledWith(mockListener);
        });
    });

    describe('addReducer', () => {
        interface StateInterface {
            count: number;
            todos?: Array<string>;
        }

        const count: Reducer<number> = (state = 0, action) => action.type === 'INCREMENT' ? state + 1 : state;
        const todos = (state: Array<string> = [], action: any): Array<string> => {
            if (action.type === 'ADD_TODO') {
                state.push(action.title);
            }

            return state;
        };

        function configure(): NgRedux<StateInterface> {
            const store = new NgRedux<StateInterface>();
            store.configureStore(<Reducer<StateInterface>> <unknown> combineReducers({ count }), { count: 0 });

            return store;
        }

        beforeEach(() => {
            xJet.restoreAllMocks();
        });

        test('should set the initial state of the feature as soon as it is added', () => {
            const store = configure();
            store.addReducer('todos', todos);

            expect(store.getState()).toEqual({ count: 0, todos: [] });
        });

        test('should run the feature reducer on its draft and keep the root reducer running', () => {
            const store = configure();
            store.addReducer('todos', todos);
            const before = store.getState().todos;

            store.dispatch({ type: 'ADD_TODO', title: 'Write docs' });
            store.dispatch({ type: 'INCREMENT' });

            expect(store.getState()).toEqual({ count: 1, todos: [ 'Write docs' ] });
            expect(before).toEqual([]);
        });

        test('should hide the feature key from combineReducers, so it neither drops nor warns about it', () => {
            const error = xJet.spyOn(console, 'error').mockImplementation(() => undefined);
            const store = configure();
            store.addReducer('todos', todos);

            store.dispatch({ type: 'INCREMENT' });

            expect(store.getState().todos).toEqual([]);
            expect(error).not.toHaveBeenCalled();
        });

        test('should keep the state object when no reducer changed anything', () => {
            const store = configure();
            store.addReducer('todos', todos);
            const state = store.getState();

            store.dispatch({ type: 'UNKNOWN' });

            expect(store.getState()).toBe(state);
        });

        test('should include a reducer added before the store is configured', () => {
            const store = new NgRedux<StateInterface>();
            store.addReducer('todos', todos);
            store.configureStore(<Reducer<StateInterface>> <unknown> combineReducers({ count }), { count: 0 });

            expect(store.getState()).toEqual({ count: 0, todos: [] });
        });

        test('should dispatch ADD_REDUCER only for a reducer that is new for its key', () => {
            const store = configure();
            const listener = xJet.fn();
            store.subscribe(listener);

            store.addReducer('todos', todos);
            store.addReducer('todos', todos);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(ADD_REDUCER).toBe('@@angular-redux2/store/ADD_REDUCER');
        });

        test('should keep the features after the root reducer is replaced', () => {
            const store = configure();
            store.addReducer('todos', todos);

            store.replaceReducer(<Reducer<StateInterface>> <unknown> combineReducers({ count: (state: number = 0) => state + 10 }));
            store.dispatch({ type: 'ADD_TODO', title: 'a' });

            expect(store.getState()).toEqual({ count: 10, todos: [ 'a' ] });
        });
    });

    describe('replaceReducer', () => {
        beforeEach(() => {
            ReducerService.getInstance().replaceReducer = xJet.fn();
        });

        test('should call ReducerService replaceReducer with nextReducer', () => {
            const nextReducer = xJet.fn();
            ngRedux.replaceReducer(<any> nextReducer);

            expect(ReducerService.getInstance().replaceReducer).toHaveBeenCalledWith(nextReducer);
        });
    });

    describe('setStore', () => {
        let store: Store<any>;

        beforeEach(() => {
            store = createStore(() => ({}));
        });

        test('should set the store and subscribe to changes', () => {
            const spy = xJet.spyOn(store, 'subscribe');
            (ngRedux as any).setStore(store);
            expect((ngRedux as any)['reduxStore']).toBe(store);
            expect(spy).toHaveBeenCalled();
        });

        test('should update store$ when store changes', () => {
            const spy = xJet.spyOn(ngRedux['state$'], 'next');
            const state = { count: 0 };
            store = createStore(() => state);
            (ngRedux as any).setStore(store);
            expect(spy).toHaveBeenCalledWith(state);
        });
    });

    describe('select', () => {
        let mockStore: any;

        beforeEach(() => {

            // Mock store
            mockStore = {
                getState: xJet.fn(),
                subscribe: xJet.fn()
            };
            (ngRedux as any).setStore(mockStore);
        });

        test('should return an observable that emits the selected value when it changes', () => {
            // Set up mock data
            const selectedValue = 'selected value';
            const selector = xJet.fn().mockReturnValue(selectedValue);
            const comparator = xJet.fn().mockReturnValue(false);

            // Create an observable that emits values on every call
            const mockObservable = of('some value');

            // Spy on state$
            xJet.spyOn(ngRedux['state$'], 'pipe').mockReturnValueOnce(mockObservable);

            // Call the method and subscribe to the resulting observable
            const result = ngRedux.select(selector, <any> comparator);
            result.subscribe(value => {
                expect(value).toBe(selectedValue);
            });

            // Check that the state$ pipe was called with the correct operators
            expect(ngRedux['state$'].pipe).toHaveBeenCalled();
        });
    });
});
