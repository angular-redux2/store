/**
 * Import third-party libraries
 */

import { NgZone } from '@angular/core';

/**
 * Services
 */

import { NgRedux } from './ng-redux.service';
import { SubStoreService } from './sub-store.service';

/**
 * Initialize global test mocks
 */

const ngZone = new (jest.fn())();
const reduxStore = new (jest.fn())();
jest.mock('./sub-store.service');

describe('Should allow access to instance from a static method.', () => {
    test('Should throw exception that instance not initialize.', () => {
        expect(() => {
            NgRedux.store;
        }).toThrow('NgRedux failed: instance not initialize.');
    });

    test('Should return ngRedux instance.', () => {
        const ngRedux = new NgRedux<any>(ngZone);

        expect(NgRedux.store).toStrictEqual(ngRedux);
    });
});

describe('Should test throw exception in ngRedux.', () => {
    /**
     * Initialize scope test invariant variable
     */

    let ngRedux: NgRedux<any>;

    /**
     * Before & after etch test
     */

    beforeEach(() => {
        ngRedux = new NgRedux<any>(ngZone);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('Should dispatch throw exception that store instance not initialize.', () => {
        expect(() => {
            ngRedux.dispatch(<any> {})
        }).toThrow('Dispatch failed: store instance not initialize.');
    });

    test('Should throw exception that store instance already initialize.', () => {
        (ngRedux as any)._store = reduxStore;

        expect(() => {
            ngRedux.configureStore(() => {}, {})
        }).toThrow('Store already initialize!');
    });

    test('Should dispatch throw exception that store instance not initialize.', () => {
        (ngRedux as any)._store = reduxStore;

        expect(() => {
            ngRedux.provideStore(<any>{})
        }).toThrow('Store already initialize!');
    });
});

describe('Should test ngRedux functionality.', () => {
    /**
     * Initialize global test invariant variable
     */

    let ngRedux: NgRedux<any>;

    /**
     * Before & after etch test
     */

    beforeEach(() => {
        ngRedux = new NgRedux<any>(ngZone);
        (ngRedux as any)._store = reduxStore;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('Should call to the store dispatch method.', () => {
        jest.spyOn(NgZone, 'isInAngularZone').mockReturnValueOnce(true);

        const mockReduxDispatch = jest.fn();
        reduxStore.dispatch = mockReduxDispatch;

        ngRedux.dispatch(<any> {});
        expect(mockReduxDispatch).toBeCalledWith({});
    });

    test('Should call to the store dispatch method under ngZone run method.', () => {
        jest.spyOn(NgZone, 'isInAngularZone').mockReturnValueOnce(false);

        const mockNgZoneRun = jest.fn();
        const mockReduxDispatch = jest.fn();
        ngZone.run = mockNgZoneRun;
        reduxStore.dispatch = mockReduxDispatch;

        ngRedux.dispatch(<any> {});
        expect(mockNgZoneRun).toBeCalled();
    });

    test('Should call observable pip in select method.', () => {
        (ngRedux as any)._store$ = new (jest.fn())();
        (ngRedux as any)._store$.pipe = jest.fn();
        ngRedux.select();

        expect((ngRedux as any)._store$.pipe).toBeCalled();
    });

    test('Should call setStore.', () => {
        (ngRedux as any)._store = undefined;
        const setStore = jest.spyOn((ngRedux as any), 'setStore');
        ngRedux.configureStore(() => {}, {});

        expect(setStore).toBeCalled();
    });

    test('Should create new substore instance.', () => {
        const basePath = ['a', 'b'];
        const localReducer = () => {};
        ngRedux.configureSubStore(basePath, localReducer);

        expect(SubStoreService).toHaveBeenCalledWith(ngRedux, basePath, localReducer);
    });

    test('Should create new store from exists one.', () => {
        const mockNext = jest.fn();
        const mockGetState = jest.fn();
        const mockSetStore = jest.spyOn((ngRedux as any), 'setStore');
        (ngRedux as any)._store$ = new (jest.fn())();

        reduxStore.getState = mockGetState;
        (ngRedux as any)._store$.next = mockNext;
        reduxStore.subscribe = jest.fn((callback: Function) => {
            callback();
        });

        (ngRedux as any)._store = undefined;
        ngRedux.provideStore(reduxStore);

        expect(mockSetStore).toBeCalled();
        expect(mockGetState).toBeCalled();
        expect(reduxStore.subscribe).toBeCalled();
        expect(mockNext).toBeCalled();
    });

    test('Should get current state.', () => {
        const state = {
            name: 'test'
        };
        reduxStore.getState = jest.fn().mockReturnValueOnce(state);

        expect(ngRedux.getState()).toStrictEqual(state);
    });

    test('Should subscribe to redux store.', () => {
        reduxStore.subscribe = jest.fn();
        ngRedux.subscribe(() => {});

        expect(reduxStore.subscribe).toBeCalled();
    });

    test('Should call redux store replaceReducer.', () => {
        reduxStore.replaceReducer = jest.fn();
        ngRedux.replaceReducer(() => {});

        expect(reduxStore.replaceReducer).toBeCalled();
    });

    test('Should get store observable.', () => {
        (ngRedux as any)._store$ = new (jest.fn())();

        expect(ngRedux[Symbol.observable]()).toStrictEqual((ngRedux as any)._store$);
    })
});
