/**
 * Services
 */

import { NgRedux } from './ng-redux.service';
import { ReducerService } from './reducer.service';
import { SubStoreService } from './sub-store.service';

/**
 * Interfaces
 */

import { ACTION_KEY } from "../interfaces/fractal.interface";

/**
 * Component
 */

import { get } from '../components/object.component';

/**
 * Initialize global test mocks
 */

jest.mock('./ng-redux.service');

/**
 * Initialize global test invariant variable
 */

let ngRedux: NgRedux<any>;
let reducerService: ReducerService;
let subStoreService: SubStoreService<any>;
let mockHashSignature: any = jest.fn();
let mockReplaceReducer: any = jest.fn();
let mockRegisterReducer: any = jest.fn();

/**
 * Before & after etch test
 */

beforeEach(() => {
    ngRedux = new NgRedux();
    reducerService = ReducerService.getInstance();

    reducerService.hashSignature = mockHashSignature;
    reducerService.replaceReducer = mockReplaceReducer;
    reducerService.registerReducer = mockRegisterReducer;
    subStoreService = new SubStoreService<any>(ngRedux, [ 'a', 'b' ], () => {
    });
});

afterEach(() => {
    jest.resetAllMocks();
});

test('Should initialize constructor logic.', () => {
    expect(mockHashSignature).toBeCalled();
    expect(mockRegisterReducer).toBeCalled();
});

test('Should dispatch root store.', () => {
    subStoreService.dispatch(<any> {});
    expect(ngRedux.dispatch).toHaveBeenCalledWith({
        [ACTION_KEY]: {
            hash: undefined,
            path: [ 'a', 'b' ]
        }
    });
});

test('Should get substore state.', () => {
    (get as any) = jest.fn();
    subStoreService.getState();

    expect(get).toHaveBeenCalledWith(undefined, [ 'a', 'b' ]);
});

test('Should not change base path.', () => {
    const unsubscribe = jest.fn();
    (subStoreService as any).subscription = {
        unsubscribe
    };

    subStoreService.setBasePath((subStoreService as any).basePath);
    expect(unsubscribe).not.toBeCalled();
    expect(ngRedux.select).not.toBeCalled();
});

test('Should call unsubscribe and create new subscribe.', () => {
    const basePath = [ 'a' ];
    const mockNext = jest.fn();
    const mockUnsubscribe = jest.fn();
    const mockSubscribe = jest.fn((callback: Function) => {
        callback();
    });

    (subStoreService as any)._store$.next = mockNext;
    (ngRedux.select as jest.Mock).mockReturnValueOnce({ subscribe: mockSubscribe });
    (subStoreService as any).subscription = {
        unsubscribe: mockUnsubscribe
    };

    subStoreService.setBasePath(basePath);
    expect(mockUnsubscribe).toBeCalled();
    expect(ngRedux.select).toBeCalledWith(basePath);
    expect(mockSubscribe).toBeCalled();
    expect(mockNext).toBeCalled();
});

test('Should create new substore instance.', () => {
    const mockSubscribe = jest.fn();
    (ngRedux.select as jest.Mock).mockReturnValueOnce({ subscribe: mockSubscribe });

    const instance = subStoreService.configureSubStore([ 'a', 'b', 'c' ], () => {
    });
    expect((subStoreService as any).basePath).toStrictEqual([ 'a', 'b' ]);
    expect((instance as any).basePath).toStrictEqual([ 'a', 'b', 'a', 'b', 'c' ]);
});

test('Should call observable pip in sub store select method.', () => {
    (subStoreService as any)._store$ = new (jest.fn())();
    (subStoreService as any)._store$.pipe = jest.fn();
    subStoreService.select();

    expect((subStoreService as any)._store$.pipe).toBeCalled();
});

test('Should subscribe to substore changes.', () => {
    const mockSelect = jest.spyOn(subStoreService, 'select');
    subStoreService.subscribe(() => {});

    expect(mockSelect).toBeCalled();
});

test('Should replace reducer.', () => {
    subStoreService.replaceReducer(() => {});
    expect(mockReplaceReducer).toBeCalled();
});

test('Should get store observable.', () => {
    (subStoreService as any)._store$ = new (jest.fn())();

    expect(subStoreService[Symbol.observable]()).toStrictEqual((subStoreService as any)._store$);
})
