/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { NgRedux } from '@services/ng-redux.service';

/**
 * Imports
 */

import { of } from 'rxjs';
import { get } from '@components/object.component';
import { ACTION_KEY } from '@interfaces/fractal.interface';
import { ReducerService } from '@services/reducer.service';
import { SubStoreService } from '@services/sub-store.service';

describe('SubStoreService', () => {
    let ngRedux: NgRedux<any>;
    let reducerService: ReducerService;
    let subStoreService: SubStoreService<any>;
    let mockHashSignature: ReturnType<typeof xJet.fn>;
    let mockReplaceReducer: ReturnType<typeof xJet.fn>;
    let mockRegisterReducer: ReturnType<typeof xJet.fn>;

    beforeEach(() => {
        ngRedux = <any> {
            select: xJet.fn(),
            dispatch: xJet.fn(),
            getState: xJet.fn()
        };
        reducerService = ReducerService.getInstance();
        mockHashSignature = xJet.fn();
        mockReplaceReducer = xJet.fn();
        mockRegisterReducer = xJet.fn();
        reducerService.hashSignature = <any> mockHashSignature;
        reducerService.replaceReducer = mockReplaceReducer;
        reducerService.registerSubReducer = mockRegisterReducer;
        subStoreService = new SubStoreService<any>(ngRedux, [ 'a', 'b' ], <any> xJet.fn);
    });

    afterEach(() => {
        xJet.restoreAllMocks();
    });

    describe('constructor', () => {
        test('should initialize constructor logic.', () => {
            expect(mockHashSignature).toHaveBeenCalled();
            expect(mockRegisterReducer).toHaveBeenCalled();
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
            xJet.mock(get);
            subStoreService.getState();
            expect(get).toHaveBeenCalledWith(undefined, [ 'a', 'b' ]);
        });

        test('should call get with correct arguments', () => {
            xJet.mock(get);
            subStoreService.getState();
            expect(get).toHaveBeenCalledWith(undefined, [ 'a', 'b' ]);
        });
    });

    describe('setBasePath', () => {
        test('should leave the root store alone when the path is the one in use', () => {
            subStoreService.setBasePath((subStoreService as any).basePath);

            expect(ngRedux.select).not.toHaveBeenCalled();
        });

        test('should move existing selections to the new path', () => {
            const seen: Array<unknown> = [];
            xJet.mock(ngRedux.select).mockImplementation(<any> ((path: Array<string>) => of(path.join('.'))));

            const subscription = subStoreService.select().subscribe(value => seen.push(value));
            subStoreService.setBasePath([ 'c' ]);
            subscription.unsubscribe();

            expect(seen).toEqual([ 'a.b', 'c' ]);
        });
    });

    describe('select', () => {
        test('should not subscribe to the root store until the selection is subscribed', () => {
            subStoreService.select('x');

            expect(ngRedux.select).not.toHaveBeenCalled();
        });

        test('should select relative to the base path', () => {
            const seen: Array<unknown> = [];
            xJet.mock(ngRedux.select).mockImplementation(<any> (() => of({ x: 7 })));

            subStoreService.select('x').subscribe(value => seen.push(value)).unsubscribe();

            expect(ngRedux.select).toHaveBeenCalledWith([ 'a', 'b' ]);
            expect(seen).toEqual([ 7 ]);
        });
    });

    describe('configureSubStore', () => {
        test('should create a new substore instance with correct base path', () => {
            const mockSubscribe = xJet.fn();
            (ngRedux.select as ReturnType<typeof xJet.fn>).mockReturnValueOnce({ subscribe: mockSubscribe });

            const instance = subStoreService.configureSubStore([ 'a', 'b', 'c' ], <any> xJet.fn);
            expect((subStoreService as any).basePath).toEqual([ 'a', 'b' ]);
            expect((instance as any).basePath).toEqual([ 'a', 'b', 'a', 'b', 'c' ]);
        });
    });

    describe('subscribe', () => {
        test('should call select method', () => {
            const mockSelect = xJet.spyOn(subStoreService, 'select');
            subStoreService.subscribe(xJet.fn);
            expect(mockSelect).toHaveBeenCalled();
        });

        test('should assign new subscription', () => {
            xJet.spyOn(subStoreService, 'select');
            subStoreService.subscribe(xJet.fn);

            expect(subStoreService.select).toHaveBeenCalled();
        });

        test('should call select and subscribe to substore changes', () => {
            const mockSelect = xJet.spyOn(subStoreService, 'select');
            subStoreService.subscribe(xJet.fn);
            expect(mockSelect).toHaveBeenCalled();
        });
    });

    describe('replaceReducer', () => {
        test('should call replaceReducer on reducer service', () => {
            xJet.spyOn((subStoreService as any).reducerService, 'replaceSubReducer').mockImplementation(mockReplaceReducer);
            subStoreService.replaceReducer(<any> xJet.fn);
            expect(mockReplaceReducer).toHaveBeenCalled();
        });
    });
});
