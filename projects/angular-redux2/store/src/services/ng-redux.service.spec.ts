/**
 * Import third-party libraries
 */

import { of } from 'rxjs';
import { NgZone } from '@angular/core';
import { compose, createStore } from 'redux';

/**
 * Import third-party types
 */

import type { Reducer, Store, StoreEnhancer } from 'redux';

/**
 * angular-redux2
 */

import { NgRedux } from './ng-redux.service';
import { ReducerService } from './reducer.service';
import { SubStoreService } from './sub-store.service';

/**
 * angular-redux2 types
 */

import type { Middleware } from '../interfaces/reducer.interface';

describe('NgRedux', () => {
    let ngRedux: NgRedux;
    let mockReduxCompose: jest.Mock;

    beforeEach(() => {
        ngRedux = new NgRedux();
        mockReduxCompose = jest.fn().mockReturnValue(createStore);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('store', () => {
        test('should throw an error if instance is not initialized', () => {
            // Arrange
            (NgRedux as any).instance = undefined;

            // Act & Assert
            expect(() => NgRedux.store).toThrowError('NgRedux failed: instance not initialize.');
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
        const middleware: Middleware[] = [];
        const enhancers: Array<StoreEnhancer<any>> = [];

        test('should throw an error if store is already initialized', () => {
            // Arrange
            ngRedux['_store'] = {} as any; // set the private _store property to an object

            // Act and assert
            expect(() => ngRedux.configureStore(reducer, initState, middleware, enhancers)).toThrowError(
                'Store already initialize!'
            );
        });

        test('should call setStore with the created store', () => {
            // Arrange
            const setStoreSpy = jest.spyOn(ngRedux as any, 'setStore');
            const expectedStore = {} as any;

            jest.spyOn(ReducerService.getInstance(), 'composeReducers').mockReturnValue(() => expectedStore);
            jest.spyOn<any, any>(compose, 'apply').mockReturnValue(mockReduxCompose);

            // Act
            ngRedux.configureStore(reducer, initState, middleware, enhancers);

            // Assert
            expect(mockReduxCompose).toHaveBeenCalledWith(createStore);
            expect(ReducerService.getInstance().composeReducers).toHaveBeenCalledWith(reducer, middleware);
            expect(setStoreSpy).toHaveBeenCalled();
        });
    });

    describe('configureSubStore', () => {
        test('should create a new SubStoreService instance', () => {
            const reducer = (state = {}) => state;
            const initState = {};

            jest.spyOn(ReducerService.getInstance(), 'composeReducers').mockReturnValue(() => initState);
            jest.spyOn<any, any>(compose, 'apply').mockReturnValue(mockReduxCompose);
            jest.spyOn<any, any>(compose, 'apply').mockReturnValue(mockReduxCompose);

            ngRedux.configureStore(reducer, initState);

            const subStore = ngRedux.configureSubStore([ 'path' ], reducer);
            expect(subStore).toBeInstanceOf(SubStoreService);
        });
    });

    describe('provideStore', () => {
        let spyReplaceReducer: jest.SpyInstance;
        const reducer = (state = {}) => state;

        beforeEach(() => {
            spyReplaceReducer = jest.spyOn(
                ReducerService.getInstance(),
                'composeReducers'
            ).mockReturnValueOnce(reducer);
        });

        test('should replace the store reducer and initialize the store', () => {
            const store = createStore(reducer);

            const mockReplaceReducer = jest.spyOn(
                store,
                'replaceReducer'
            );

            ngRedux.provideStore(reducer, store);

            expect(spyReplaceReducer).toHaveBeenCalledWith(reducer);
            expect(mockReplaceReducer).toHaveBeenCalled();
            expect(ngRedux['_store']).toBe(store);
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
            (ngRedux as any)._store = {
                getState: jest.fn().mockReturnValueOnce(expectedState)
            };

            const result = ngRedux.getState();

            expect((ngRedux as any)._store.getState).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedState);
        });
    });

    describe('dispatch', () => {
        let store: Store<any, any>;
        const reducer = (state = {}) => state;

        beforeEach(() => {
            jest.spyOn(
                ReducerService.getInstance(),
                'composeReducers'
            ).mockReturnValueOnce(reducer);

            store = createStore(() => ({}));
            ngRedux.provideStore(() => ({}), store);
        });

        test('dispatches an action to the store', () => {
            const action = { type: 'TEST_ACTION' };
            const dispatchSpy = jest.spyOn(store, 'dispatch');

            ngRedux.dispatch(action);

            expect(dispatchSpy).toHaveBeenCalledWith(action);
        });

        test('throws an error when the store is not initialized', () => {
            ngRedux = new NgRedux(); // initialize without store
            const action = { type: 'TEST_ACTION' };

            expect(() => ngRedux.dispatch(action)).toThrow('Dispatch failed: store instance not initialize.');
        });

        test('runs the dispatch inside NgZone if it exists and is outside the zone', () => {
            const action = { type: 'TEST_ACTION' };
            const dispatchSpy = jest.spyOn(store, 'dispatch');
            const runMock = jest.fn((callback) => {
                callback();
            });

            (ngRedux as any).ngZone = { run: runMock } as any;
            NgZone.isInAngularZone = jest.fn(() => false);

            ngRedux.dispatch(action);

            expect(runMock).toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalledWith(action);
        });
    });

    describe('subscribe', () => {
        test('should subscribe a listener to the store', () => {
            const mockListener = jest.fn();
            const mockUnsubscribe = jest.fn();
            const mockStore = {
                getState: jest.fn().mockReturnValue({}),
                subscribe: jest.fn(() => mockUnsubscribe),
            };

            (ngRedux as any).setStore(mockStore as any);

            const result = ngRedux.subscribe(mockListener);

            expect(result).toBe(mockUnsubscribe);
            expect(mockStore.subscribe).toHaveBeenCalledWith(mockListener);
        });
    });

    describe('replaceReducer', () => {
        beforeEach(() => {
            ReducerService.getInstance().replaceReducer = jest.fn();
        });

        test('should call ReducerService replaceReducer with nextReducer', () => {
            const nextReducer = jest.fn();
            ngRedux.replaceReducer(nextReducer);

            expect(ReducerService.getInstance().replaceReducer).toHaveBeenCalledWith(nextReducer);
        });
    });

    describe('setStore', () => {
        let store: Store<any>;

        beforeEach(() => {
            store = createStore(() => ({}));
        });

        test('should set the store and subscribe to changes', () => {
            const spy = jest.spyOn(store, 'subscribe');
            (ngRedux as any).setStore(store);
            expect((ngRedux as any)['_store']).toBe(store);
            expect(spy).toHaveBeenCalled();
            expect(ngRedux['_unsubscribe']).not.toBeNull();
        });

        test('should update store$ when store changes', () => {
            const spy = jest.spyOn(ngRedux['_store$'], 'next');
            const state = { count: 0 };
            store = createStore(() => state);
            (ngRedux as any).setStore(store);
            expect(spy).toHaveBeenCalledWith(state);
        });
    });

    describe('replaceStore', () => {
        let store: Store<any>;
        let ngRedux: NgRedux;

        beforeEach(() => {
            ngRedux = new NgRedux<any>();
            store = createStore(() => ({}));
        });

        test('should call setStore', () => {
            const setStoreMock = jest.fn();
            const unsubscribeMock = jest.fn();
            ngRedux['setStore'] = setStoreMock;
            ngRedux['_unsubscribe'] = unsubscribeMock;

            ngRedux.replaceStore(store);

            expect(setStoreMock).toHaveBeenCalledWith(store);
            expect(unsubscribeMock).toHaveBeenCalled();
        });
    });

    describe('select', () => {
        let mockStore: any;

        beforeEach(() => {

            // Mock store
            mockStore = {
                getState: jest.fn(),
                subscribe: jest.fn(),
            };
            (ngRedux as any).setStore(mockStore);
        });

        test('should return an observable that emits the selected value when it changes', () => {
            // Set up mock data
            const selectedValue = 'selected value';
            const selector = jest.fn().mockReturnValue(selectedValue);
            const comparator = jest.fn().mockReturnValue(false);

            // Create an observable that emits values on every call
            const mockObservable = of('some value');

            // Spy on _store$
            jest.spyOn(ngRedux['_store$'], 'pipe').mockReturnValueOnce(mockObservable);

            // Call the method and subscribe to the resulting observable
            const result = ngRedux.select(selector, comparator);
            result.subscribe(value => {
                expect(value).toBe(selectedValue);
            });

            // Check that the _store$ pipe was called with the correct operators
            expect(ngRedux['_store$'].pipe).toHaveBeenCalled();
        });
    });
});
