/**
 * angular-redux2
 */

import { NgRedux } from './ng-redux.service';
import { ReducerService } from './reducer.service';
import { get } from '../components/object.component';
import { SubStoreService } from './sub-store.service';
import { ACTION_KEY } from '../interfaces/fractal.interface';

/**
 * angular-redux2 types
 */

import { NextMiddleware } from '../interfaces/reducer.interface';

/**
 * Mocks
 */

jest.mock('./ng-redux.service');

describe('SubStoreService', () => {
    let ngRedux: NgRedux<any>;
    let mockNext: NextMiddleware;
    let reducerService: ReducerService;
    let subStoreService: SubStoreService<any>;
    let mockUnsubscribe: jest.Mock;
    let mockHashSignature: jest.Mock;
    let mockReplaceReducer: jest.Mock;
    let mockRegisterReducer: jest.Mock;

    beforeEach(() => {
        ngRedux = new NgRedux();
        mockNext = jest.fn();
        reducerService = ReducerService.getInstance();
        mockUnsubscribe = jest.fn();
        mockHashSignature = jest.fn();
        mockReplaceReducer = jest.fn();
        mockRegisterReducer = jest.fn();
        reducerService.hashSignature = mockHashSignature;
        reducerService.replaceReducer = mockReplaceReducer;
        reducerService.registerSubReducer = mockRegisterReducer;
        subStoreService = new SubStoreService<any>(ngRedux, [ 'a', 'b' ], jest.fn);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('constructor', () => {
        test('should initialize constructor logic.', () => {
            expect(mockHashSignature).toBeCalled();
            expect(mockRegisterReducer).toBeCalled();
        });
    });

    describe('dispatch', () => {
        test('should dispatch root store.', () => {
            subStoreService.dispatch(<any>{});
            expect(ngRedux.dispatch).toHaveBeenCalledWith({
                [ACTION_KEY]: {
                    hash: undefined,
                    path: [ 'a', 'b' ]
                }
            });
        });

        test('should dispatch to root store with correct action key', () => {
            subStoreService.dispatch({
                type: 'test'
            });
            expect(ngRedux.dispatch).toHaveBeenCalledWith({
                type: 'test',
                [ACTION_KEY]: {
                    hash: undefined,
                    path: [ 'a', 'b' ]
                }
            });
        });
    });

    describe('getState', () => {
        test('should get substore state.', () => {
            (get as jest.Mock) = jest.fn();
            subStoreService.getState();
            expect(get).toHaveBeenCalledWith(undefined, [ 'a', 'b' ]);
        });

        test('should call get with correct arguments', () => {
            (get as any) = jest.fn();
            subStoreService.getState();
            expect(get).toHaveBeenCalledWith(undefined, [ 'a', 'b' ]);
        });
    });

    describe('setBasePath', () => {
        test('should not change base path.', () => {
            const unsubscribe = jest.fn();
            (subStoreService as any).subscription = { unsubscribe };
            subStoreService.setBasePath((subStoreService as any).basePath);

            expect(unsubscribe).not.toBeCalled();
            expect(ngRedux.select).not.toBeCalled();
        });

        test('should not call unsubscribe or ngRedux.select if base path is unchanged', () => {
            const unsubscribe = jest.fn();
            (subStoreService as any).subscription = {
                unsubscribe
            };

            subStoreService.setBasePath((subStoreService as any).basePath);
            expect(unsubscribe).not.toBeCalled();
            expect(ngRedux.select).not.toBeCalled();
        });

        test('should call unsubscribe and create new subscribe if base path is changed', () => {
            const basePath = [ 'a' ];
            const mockSubscribe = jest.fn((callback: any) => {
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
    });

    describe('configureSubStore', () => {
        test('should create a new substore instance with correct base path', () => {
            const mockSubscribe = jest.fn();
            (ngRedux.select as jest.Mock).mockReturnValueOnce({ subscribe: mockSubscribe });

            const instance = subStoreService.configureSubStore([ 'a', 'b', 'c' ], jest.fn);
            expect((subStoreService as any).basePath).toStrictEqual([ 'a', 'b' ]);
            expect((instance as any).basePath).toStrictEqual([ 'a', 'b', 'a', 'b', 'c' ]);
        });
    });

    describe('subscribe', () => {
        test('should call select method', () => {
            const mockSelect = jest.spyOn(subStoreService, 'select');
            subStoreService.subscribe(jest.fn);
            expect(mockSelect).toBeCalled();
        });

        test('should assign new subscription', () => {
            jest.spyOn(subStoreService, 'select');
            subStoreService.subscribe(jest.fn);

            expect(subStoreService.select).toBeCalled();
        });

        test('should call select and subscribe to substore changes', () => {
            const mockSelect = jest.spyOn(subStoreService, 'select');
            subStoreService.subscribe(jest.fn);
            expect(mockSelect).toBeCalled();
        });
    });

    describe('replaceReducer', () => {
        test('should call replaceReducer on reducer service', () => {
            jest.spyOn((subStoreService as any).reducerService, 'replaceSubReducer').mockImplementation(mockReplaceReducer);
            subStoreService.replaceReducer(jest.fn);
            expect(mockReplaceReducer).toBeCalled();
        });
    });
});
