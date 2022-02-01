/**
 * Imports third-party libraries
 */

import { Action } from 'redux';
import { Observable } from 'rxjs';
import { map, take, toArray } from 'rxjs/operators';
import { Component, Injectable, NgZone } from '@angular/core';

/**
 * NgRedux
 */

import { NgRedux } from '../services/ng-redux.service';

/**
 * Decorator
 */

import { Dispatch } from './dispatch.decorator';
import { Substore } from './substore.decorator';
import { Select, Select$ } from './select.decorator';

/**
 * Import interface
 */

import { PathSelector } from '../interfaces/store.interface';

/**
 * Zone
 */

class MockNgZone extends NgZone {
    override run<T>(fn: (...args: any[]) => T): T {
        return fn() as T;
    }
}

/**
 * Init store
 */

let ngRedux: NgRedux<any>;
const localReducer = (state: any, _: Action) => state;
const mockNgZone = new MockNgZone({ enableLongStackTrace: false }) as NgZone;

/**
 * Before each test
 */

beforeEach(() => {
    const defaultState = {
        foo: 'Root Foo!',
        a: {
            b: { foo: 'Foo!' },
        },
    };

    ngRedux = new NgRedux<any>(mockNgZone);
    ngRedux.configureStore((state: any, _: Action) => state, defaultState);
});


describe('on the class causes @select to', () => {
    test('use a substore for inferred-name selections', () => {
        @Substore(localReducer)
        class TestClass {
            @Select() foo: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.foo.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('use a substore for inferred-name selections with $ on the end', () => {
        @Substore(localReducer)
        class TestClass {
            @Select() foo$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('use a substore for a property selector', () => {
        @Substore(localReducer)
        class TestClass {
            @Select('foo') obs$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('use a substore for a function selector', () => {
        @Substore(localReducer)
        class TestClass {
            @Select((s: any) => s.foo)
            obs$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('use a substore for a path selector', () => {
        @Substore(localReducer)
        class TestClass {
            @Select([ 'b', 'foo' ])
            obs$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a' ];
        }

        const testInstance = new TestClass();
        testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('use a substore for a property selector with a comparator', () => {
        @Substore(localReducer)
        class TestClass {
            @Select('foo', (x: any, y: any) => x !== y)
            obs$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    /**
     * This looks odd, but it's because @select turns the property into a
     * getter. In theory that getter could return a new Observable instance
     * each time, which would be bad because it would leak memory like crazy.
     * This test is just checking that it's a stable reference to the same
     * instance.
     */

    test('return a stable reference for the decorated property', () => {
        @Substore(localReducer)
        class TestClass {
            @Select('foo') obs$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        expect(testInstance.obs$ === testInstance.obs$).toEqual(true);
    });

    test('handle a base path with no extant store data', () => {
        const iDontExistYetReducer = (
            state: any,
            action: Action & { newValue?: string }
        ) => ({ ...state, nonExistentKey: action.newValue });

        @Substore(iDontExistYetReducer)
        class TestClass {
            @Select('nonExistentKey') obs$: Observable<string>;
            getBasePath = (): PathSelector => [ 'I', `don't`, 'exist', 'yet' ];
            @Dispatch
            makeItExist = (newValue: string) => ({ type: 'nvm', newValue });
        }

        const testInstance = new TestClass();
        testInstance.obs$
            .pipe(take(2), toArray())
            .subscribe((v: Array<any>) =>
                expect(v).toEqual([ undefined, 'now I exist' ])
            );
        testInstance.makeItExist('now I exist');
    });
});

describe('on the class causes @select$ to', () => {
    test('use a substore for a property selector', () => {
        @Substore(localReducer)
        class TestClass {
            @Select$('foo', (o$: any) => o$.pipe(map((x: any) => x)))
            obs$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('use a substore for a function selector', () => {
        @Substore(localReducer)
        class TestClass {
            @Select$((s: any) => s.foo, (o$: any) => o$.pipe(map((x: any) => x)))
            obs$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('use a substore for a path selector', () => {
        @Substore(localReducer)
        class TestClass {
            @Select$([ 'b', 'foo' ], (o$: any) => o$.pipe(map((x: any) => x)))
            obs$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a' ];
        }

        const testInstance = new TestClass();
        testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('use a substore for a property selector with a comparator', () => {
        @Substore(localReducer)
        class TestClass {
            @Select$('foo', (o$: any) => o$.pipe(map((x: any) => x)), (x: any, y: any) => x !== y)
            obs$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.obs$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });
});

describe('on the class causes @dispatch to', () => {
    test('scope dispatches to substore', () => {
        jest.spyOn(NgRedux.store, 'dispatch');

        @Substore(localReducer)
        class TestClass {
            @Dispatch createFooAction = () => ({ type: 'FOO' });
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        new TestClass().createFooAction();
        expect(ngRedux.dispatch).toHaveBeenCalledWith({
            type: 'FOO',
            '@angular-redux2::fractalKey': JSON.stringify([ 'a', 'b' ]),
        });
    });
});

describe('coexists with', () => {
    test('@Component', () => {
        @Component({ template: '<p>Wat</p>' })
        @Substore(localReducer)
        class TestClass {
            @Select() foo$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('@Component the other way round', () => {
        @Substore(localReducer)
        @Component({ template: '<p>Wat</p>' })
        class TestClass {
            @Select() foo$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('@Injectable', () => {
        @Injectable()
        @Substore(localReducer)
        class TestClass {
            @Select() foo$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('@Injectable in the other order', () => {
        @Substore(localReducer)
        @Injectable()
        class TestClass {
            @Select() foo$: Observable<string>;
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new TestClass();
        testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });
});

describe('with inheritance', () => {
    test('lets you select in a super class against a path from the sub class', () => {
        @Substore(localReducer)
        class SuperClass {
            @Select() foo$: Observable<string>;
        }

        class SubClass extends SuperClass {
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        const testInstance = new SubClass();
        testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('lets you select in a sub class against a path from the super class', () => {
        @Substore(localReducer)
        class SuperClass {
            getBasePath = (): PathSelector => [ 'a', 'b' ];
        }

        class SubClass extends SuperClass {
            @Select() foo$: Observable<string>;
        }

        const testInstance = new SubClass();
        testInstance.foo$.pipe(take(1)).subscribe(v => expect(v).toEqual('Foo!'));
    });

    test('modifies behaviour of superclass selects in the subclass only', () => {
        class SuperClass {
            @Select() foo$: Observable<string>;
        }

        @Substore(localReducer)
        class SubClass extends SuperClass {
            getBasePath = (): PathSelector => [ 'a', 'b' ];
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
