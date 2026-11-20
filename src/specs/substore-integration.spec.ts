/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Observable } from 'rxjs';
import type { Action, UnknownAction } from 'redux';
import type { SubStoreService } from '@services/sub-store.service';
import type { PathSelectorType } from '@interfaces/store.interface';

/**
 * Imports
 */

import 'zone.js';
import { map, take, toArray } from 'rxjs/operators';
import { NgRedux } from '@services/ng-redux.service';
import { Dispatch } from '@decorators/dispatch.decorator';
import { Substore } from '@decorators/substore.decorator';
import { ACTION_KEY } from '@interfaces/fractal.interface';
import { ReducerService } from '@services/reducer.service';
import { Component, Injectable, NgZone } from '@angular/core';
import { Select, Select$ } from '@decorators/select.decorator';

/**
 * Zone
 */

class MockNgZone extends NgZone {
    override run<T>(fn: (...args: any[]) => T): T {
        return fn() as T;
    }
}

describe('Substore', () => {
    let ngRedux: NgRedux<any>;
    const localReducer = (state: any, _: Action) => state;
    const mockNgZone = new MockNgZone({ enableLongStackTrace: false }) as NgZone;

    beforeEach(() => {
        const defaultState = {
            foo: 'Root Foo!',
            a: {
                b: { foo: 'Foo!' }
            }
        };

        ngRedux = new NgRedux<any>(mockNgZone);
        ngRedux.configureStore((state: any, _: Action) => state, defaultState);
    });

    describe('Should on the class causes @select to', () => {
        test('Should use a substore for inferred-name selections.', () => {
            @Substore(localReducer)
            class TestClass {
                @Select() foo: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.foo.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should use a substore for inferred-name selections with $ on the end.', () => {
            @Substore(localReducer)
            class TestClass {
                @Select() foo$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should use a substore for a property selector.', () => {
            @Substore(localReducer)
            class TestClass {
                @Select('foo') obs$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should use a substore for a function selector.', () => {
            @Substore(localReducer)
            class TestClass {
                @Select((s: { foo: string }) => s.foo)
                    obs$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should use a substore for a path selector.', () => {
            @Substore(localReducer)
            class TestClass {
                @Select([ 'b', 'foo' ])
                    obs$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a' ];
            }

            const testInstance = new TestClass();
            testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should use a substore for a property selector with a comparator.', () => {
            @Substore(localReducer)
            class TestClass {
                @Select('foo', (x, y) => x !== y)
                    obs$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        /**
         * This looks odd, but it's because `@Select` turns the property into a getter.
         * In theory, that getter could return a new Observable instance
         * each time, which would be bad because it would leak memory like crazy.
         * This test is just checking that it's a stable reference to the same
         * instance.
         */

        test('Should return a stable reference for the decorated property.', () => {
            @Substore(localReducer)
            class TestClass {
                @Select('foo') obs$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            expect(testInstance.obs$ === testInstance.obs$).toEqual(true);
        });

        test('Should handle a base path with no extant store data.', () => {
            const iDontExistYetReducer = (
                state: any,
                action: Action & { newValue?: string }
            ) => ({ ...state, nonExistentKey: action.newValue });

            @Substore(iDontExistYetReducer)
            class TestClass {
                @Select('nonExistentKey') obs$: Observable<string>;
                @Dispatch makeItExist = (newValue: string) => {
                    return { type: 'nvm', newValue };
                };

                basePath = (): PathSelectorType => [ 'I', 'don\'t', 'exist', 'yet' ];
            }

            const testInstance = new TestClass();
            testInstance.obs$
                .pipe(take(2), toArray())
                .subscribe((v: any[]) =>
                    expect(v).toEqual([ undefined, 'now I exist' ])
                );
            testInstance.makeItExist('now I exist');
        });
    });

    describe('Should on the class causes @select$ to', () => {
        test('Should use a substore for a property selector.', () => {
            @Substore(localReducer)
            class TestClass {
                @Select$('foo', o$ => o$.pipe(map((x: any) => x))) obs$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should use a substore for a function selector.', () => {
            @Substore(localReducer)
            class TestClass {
                @Select$((s: { foo: string }) => s.foo, o$ => o$.pipe(map((x: string) => x)))
                    obs$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should use a substore for a path selector.', () => {
            @Substore(localReducer)
            class TestClass {
                @Select$([ 'b', 'foo' ], o$ => o$.pipe(map((x: any) => x)))
                    obs$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a' ];
            }

            const testInstance = new TestClass();
            testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should use a substore for a property selector with a comparator.', () => {
            @Substore(localReducer)
            class TestClass {
                @Select$('foo', o$ => o$.pipe(map((x: any) => x)), (x, y) => x !== y)
                    obs$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });
    });

    describe('Should the class causes @dispatch to', () => {
        test('Should scope dispatches to substore.', () => {
            xJet.spyOn(NgRedux.store, 'dispatch');

            @Substore(localReducer)
            class TestClass {
                @Dispatch createFooAction = () => ({ type: 'FOO' });
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            new TestClass().createFooAction();
            expect(ngRedux.dispatch).toHaveBeenCalledWith({
                type: 'FOO',
                [ACTION_KEY]: {
                    'hash': ReducerService.getInstance().hashSignature(localReducer.toString()),
                    path: [ 'a', 'b' ]
                }
            });
        });
    });

    describe('Should work coexists with order decorators.', () => {
        test('Should work with @Component', () => {
            @Component({ template: '<p>Wat</p>' })
            @Substore(localReducer)
            class TestClass {
                @Select() foo$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should work with @Component the other way round.', () => {
            @Substore(localReducer)
            @Component({ template: '<p>Wat</p>' })
            class TestClass {
                @Select() foo$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should work with @Injectable.', () => {
            @Injectable()
            @Substore(localReducer)
            class TestClass {
                @Select() foo$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should work if @Injectable in the other order.', () => {
            @Substore(localReducer)
            @Injectable()
            class TestClass {
                @Select() foo$: Observable<string>;
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new TestClass();
            testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });
    });

    describe('With inheritance.', () => {
        test('Should lets you select in a super class against a path from the sub class.', () => {
            @Substore(localReducer)
            class SuperClass {
                @Select() foo$: Observable<string>;
            }

            class SubClass extends SuperClass {
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testInstance = new SubClass();
            testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should lets you select in a sub class against a path from the super class.', () => {
            @Substore(localReducer)
            class SuperClass {
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            class SubClass extends SuperClass {
                @Select() foo$: Observable<string>;
            }

            const testInstance = new SubClass();
            testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
        });

        test('Should modifies behaviour of superclass selects in the subclass only.', () => {
            class SuperClass {
                @Select() foo$: Observable<string>;
            }

            @Substore(localReducer)
            class SubClass extends SuperClass {
                basePath = (): PathSelectorType => [ 'a', 'b' ];
            }

            const testSubInstance = new SubClass();
            testSubInstance.foo$
                .pipe(take(1))
                .subscribe(v => expect(v).toEqual('Foo!'));

            const testSuperInstance = new SuperClass();
            testSuperInstance.foo$
                .pipe(take(1))
                .subscribe(v => expect(v).toEqual('Root Foo!'));
        });
    });
});

describe('NgRedux Sub-store functional', () => {
    interface SubStateInterface {
        level3: {
            level4: number;
        };
    }

    interface AppStateInterface {
        foo: {
            bar: SubStateInterface;
        };
    }

    const basePath = [ 'foo', 'bar' ];
    const rootReducer = (state: any, _: Action) => state;
    const defaultReducer = xJet.fn();

    let ngRedux: NgRedux<AppStateInterface>;
    let subStore: SubStoreService<SubStateInterface>;

    /**
     * Before each test
     */

    beforeAll(() => {
        ngRedux = new NgRedux<AppStateInterface>(new MockNgZone({
            enableLongStackTrace: false
        }) as NgZone);

        ngRedux.configureStore(rootReducer, {
            foo: {
                bar: {
                    level3: {
                        level4: 3
                    }
                }
            }
        });

        subStore = ngRedux.configureSubStore<SubStateInterface>(basePath, <any> defaultReducer);
    });

    test('Should gets state rooted at the base path.', () => {
        expect(subStore.getState()).toEqual({
            level3: {
                level4: 3
            }
        });
    });

    test('Should selects based on base path.', () => {
        subStore.select('level3').subscribe(wat => {
            expect(wat).toEqual({ level4: 3 });
        });
    });

    test('Should handles property selection on a base path that doesn\'t exist yet.', () => {
        const nonExistentSubStore = ngRedux.configureSubStore(
            [ 'sure', 'whatever' ],
            (state: any, action: any) => ({ ...state, value: action.newValue })
        );

        nonExistentSubStore
            .select<any>('value')
            .pipe(take(2), toArray())
            .subscribe(v => {
                expect(v).toEqual([ undefined, 'now I exist' ]);
            });

        nonExistentSubStore.dispatch<UnknownAction>({
            type: 'nvm',
            newValue: 'now I exist'
        });
    });

    test('Should handles path selection on a base path that doesn\'t exist yet', () => {
        const nonExistentSubStore = ngRedux.configureSubStore(
            [ 'sure', 'whatever' ],
            (state: any, action: any) => ({ ...state, value: action.newValue })
        );
        nonExistentSubStore
            .select<any>([ 'value' ])
            .pipe(take(2), toArray())
            .subscribe(v => {
                expect(v).toEqual([ undefined, 'now I exist' ]);
            });

        nonExistentSubStore.dispatch<UnknownAction>({
            type: 'nvm',
            newValue: 'now I exist'
        });
    });

    test('Should handles function selection on a base path that doesn\'t exist yet', () => {
        const nonExistentSubStore = ngRedux.configureSubStore(
            [ 'sure', 'whatever' ],
            (state: any, action: any) => ({ ...state, value: action.newValue })
        );
        nonExistentSubStore
            .select((s: any): any => (s ? s.value : s))
            .pipe(take(2), toArray())
            .subscribe(v => {
                expect(v).toEqual([ undefined, 'now I exist' ]);
            });

        nonExistentSubStore.dispatch<UnknownAction>({
            type: 'nvm',
            newValue: 'now I exist'
        });
    });

    test('Should create its own sub-store', () => {
        const subSubStore = subStore.configureSubStore([ 'level3' ], defaultReducer);

        defaultReducer.mockImplementationOnce((localState: any, localAction: any) => {
            expect(localState).toEqual({ level4: 3 });
            expect(localAction).toEqual({
                type: 'MY_ACTION',
                [ACTION_KEY]: {
                    hash: ReducerService.getInstance().hashSignature(defaultReducer.toString()),
                    path: [ 'foo', 'bar', 'level3' ]
                }
            });
        });

        expect(subSubStore.getState()).toEqual({ level4: 3 });
        subSubStore.dispatch<UnknownAction>({ type: 'MY_ACTION' });

        expect(defaultReducer).toHaveBeenCalled();
    });
});
