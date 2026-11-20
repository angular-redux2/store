/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Action } from 'redux';
import type { Observable } from 'rxjs';
import type { NgZone } from '@angular/core';

/**
 * Imports
 */

import { take, toArray } from 'rxjs/operators';
import { NgRedux } from '@services/ng-redux.service';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import { Select, Select$ } from '@decorators/select.decorator';

describe('Select decorator', () => {

    interface AppStateInterface {
        foo: string;
        baz: number;
    }

    class MockNgZone {
        run = (fn: any) => fn();
    }

    type PayloadActionType = Action & { payload?: any };

    /**
     * Init store
     */

    let ngRedux: NgRedux<AppStateInterface>;

    const mockNgZone = (new MockNgZone() as any) as NgZone;
    const defaultState = { foo: 'bar', baz: -1 };

    const rootReducer = (state = defaultState, action: PayloadActionType) =>
        action.payload ? Object.assign({}, state, { baz: action.payload }) : state;

    /**
     * Before each test
     */

    beforeEach(() => {
        ngRedux = new NgRedux<AppStateInterface>(mockNgZone);
        ngRedux.configureStore(rootReducer, defaultState);
    });

    describe('When passed no arguments.', () => {
        test('Should bind to a store property that matches the name of the class property.', async () => {
            class MockClass {
                @Select() baz: Observable<number>;
            }

            const mockInstance = new MockClass();

            const values = firstValueFrom(mockInstance.baz.pipe(take(2), toArray()));
            ngRedux.dispatch({ type: 'nvm', payload: 1 });

            expect(await values).toEqual([ -1, 1 ]);
        });

        test('Should bind by name ignoring any $ characters in the class property name.', async () => {
            class MockClass {
                @Select() baz$: Observable<number>;
            }

            const mockInstance = new MockClass();

            const values = firstValueFrom(mockInstance.baz$.pipe(take(2), toArray()));
            ngRedux.dispatch({ type: 'nvm', payload: 4 });

            expect(await values).toEqual([ -1, 4 ]);
        });
    });

    describe('when passed a string', () => {
        test('Should bind to the store property whose name matches the string value.', async () => {
            class MockClass {
                @Select('baz') obs$: Observable<number>;
            }

            const mockInstance = new MockClass();

            const values = firstValueFrom(mockInstance.obs$.pipe(take(2), toArray()));
            ngRedux.dispatch({ type: 'nvm', payload: 3 });

            expect(await values).toEqual([ -1, 3 ]);
        });
    });

    describe('when passed a function', () => {
        test('Should binds to the store property whose name matches the result of function.', async () => {
            const selector = (state: AppStateInterface) => state.baz * 2;

            class MockClass {
                @Select(selector) obs$: Observable<number>;
            }

            const mockInstance = new MockClass();

            const values = firstValueFrom(mockInstance.obs$.pipe(take(2), toArray()));
            ngRedux.dispatch({ type: 'nvm', payload: 5 });

            expect(await values).toEqual([ -2, 10 ]);
        });
    });

    describe('When passed a comparator.', () => {
        const comparator = (_: any, y: any): boolean => y === 1;

        class MockClass {
            @Select('baz', comparator)
                baz$: Observable<number>;
        }

        test('Should only trigger next when comparator returns true.', async () => {
            const mockInstance = new MockClass();
            const values = firstValueFrom(mockInstance.baz$.pipe(take(2), toArray()));
            ngRedux.dispatch({ type: 'nvm', payload: 1 });
            ngRedux.dispatch({ type: 'nvm', payload: 2 });

            expect(await values).toEqual([ -1, 2 ]);
        });

        test('Should receive previous and next value for comparison.', async () => {
            const spy = xJet.fn();

            class LocalMockClass {
                @Select('baz', <any> spy)
                    baz$: Observable<number>;
            }

            const mockInstance = new LocalMockClass();
            const completed = lastValueFrom(mockInstance.baz$.pipe(take(3)));

            ngRedux.dispatch({ type: 'nvm', payload: 1 });
            ngRedux.dispatch({ type: 'nvm', payload: 2 });
            await completed;

            expect(spy).toHaveBeenCalledWith(-1, 1);
            expect(spy).toHaveBeenCalledWith(1, 2);
        });
    });

    describe('@select$', () => {
        const transformer = (baz$: Observable<number>) =>
            baz$.pipe(map((baz: any) => 2 * baz));

        test('Should applies a transformer to the observable.', async () => {
            class MockClass {
                @Select$('baz', transformer)
                    baz$: Observable<number>;
            }

            const mockInstance = new MockClass();

            const values = firstValueFrom(mockInstance.baz$.pipe(take(2), toArray()));
            ngRedux.dispatch({ type: 'nvm', payload: 5 });

            expect(await values).toEqual([ -2, 10 ]);
        });

        describe('when passed a comparator', () => {
            const comparator = (_: any, y: any): boolean => y === 1;

            class MockClass {
                @Select$('baz', transformer, comparator)
                    baz$: Observable<number>;
            }

            test('Should only trigger next when the comparator returns true.', async () => {
                const mockInstance = new MockClass();
                const values = firstValueFrom(mockInstance.baz$.pipe(take(2), toArray()));
                ngRedux.dispatch({ type: 'nvm', payload: 1 });
                ngRedux.dispatch({ type: 'nvm', payload: 2 });

                expect(await values).toEqual([ -2, 2 ]);
            });

            test('Should receive previous and next value for comparison.', async () => {
                const spy = xJet.fn();

                class SpyClass {
                    @Select$('baz', transformer, <any> spy)
                        baz$: Observable<number>;
                }

                const mockInstance = new SpyClass();
                const completed = lastValueFrom(mockInstance.baz$.pipe(take(3)));

                ngRedux.dispatch({ type: 'nvm', payload: 1 });
                ngRedux.dispatch({ type: 'nvm', payload: 2 });
                await completed;

                expect(spy).toHaveBeenCalledWith(-2, 2);
                expect(spy).toHaveBeenCalledWith(2, 4);
            });
        });
    });
});
