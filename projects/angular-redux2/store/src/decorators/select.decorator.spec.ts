/**
 * Imports third-party libraries
 */

import { Action } from "redux";
import { Observable } from "rxjs";
import { NgZone } from "@angular/core";
import { map, take, toArray } from "rxjs/operators";

/**
 * Decorator
 */

import { Select, Select$ } from "./select.decorator";

/**
 * NgRedux
 */

import { NgRedux } from "../services/ng-redux.service";

/**
 * Zone
 */

class MockNgZone {
    run = (fn: Function) => fn();
}

/**
 * Main store
 */

interface IAppState {
    foo: string;
    baz: number;
}

type PayloadAction = Action & { payload?: any };

/**
 * Init store
 */

let ngRedux: NgRedux<IAppState>;

const mockNgZone = (new MockNgZone() as any) as NgZone;
const defaultState = { foo: 'bar', baz: -1 };

const rootReducer = (state = defaultState, action: PayloadAction) =>
    action.payload ? Object.assign({}, state, { baz: action.payload }) : state;

/**
 * Before each test
 */

beforeEach(() => {
    ngRedux = new NgRedux<IAppState>(mockNgZone);
    ngRedux.configureStore(rootReducer, defaultState);
});

/**
 * @Select  decorator
 */

describe('when passed no arguments', () => {
    test('binds to a store property that matches the name of the class property', (done) => {
        class MockClass {
            @Select() baz: Observable<number>;
        }

        const mockInstance = new MockClass();

        mockInstance.baz
            .pipe(take(2), toArray())
            .subscribe({
                next: values => expect(values).toEqual([ -1, 1 ]),
                error: undefined,
                complete: done
            });
        ngRedux.dispatch({ type: 'nvm', payload: 1 });
    });

    test('binds by name ignoring any $ characters in the class property name', (done) => {
        class MockClass {
            @Select() baz$: Observable<number>;
        }

        const mockInstance = new MockClass();

        mockInstance.baz$
            .pipe(take(2), toArray())
            .subscribe({
                next: values => expect(values).toEqual([ -1, 4 ]),
                error: undefined,
                complete: done
            });
        ngRedux.dispatch({ type: 'nvm', payload: 4 });
    });
});

describe('when passed a string', () => {
    test('binds to the store property whose name matches the string value', (done) => {
        class MockClass {
            @Select('baz') obs$: Observable<number>;
        }

        const mockInstance = new MockClass();

        mockInstance.obs$
            .pipe(take(2), toArray())
            .subscribe({
                next: values => expect(values).toEqual([ -1, 3 ]),
                error: undefined,
                complete: done
            });
        ngRedux.dispatch({ type: 'nvm', payload: 3 });
    });
});

describe('when passed a function', () => {
    test('', (done) => {
        const selector = (state: IAppState) => state.baz * 2;

        class MockClass {
            @Select(selector) obs$: Observable<number>;
        }

        const mockInstance = new MockClass();

        mockInstance.obs$
            .pipe(take(2), toArray())
            .subscribe({
                next: values => expect(values).toEqual([ -2, 10 ]),
                error: undefined,
                complete: done
            });
        ngRedux.dispatch({ type: 'nvm', payload: 5 });
    });
});

describe('when passed a comparator', () => {
    const comparator = (_: any, y: any): boolean => y === 1;

    class MockClass {
        @Select('baz', comparator)
        baz$: Observable<number>;
    }

    test('should only trigger next when comparator returns true', (done) => {
        const mockInstance = new MockClass();
        mockInstance.baz$
            .pipe(take(2), toArray())
            .subscribe({
                next: values => expect(values).toEqual([ -1, 2 ]),
                error: undefined,
                complete: done
            });
        ngRedux.dispatch({ type: 'nvm', payload: 1 });
        ngRedux.dispatch({ type: 'nvm', payload: 2 });
    });

    test('should receive previous and next value for comparison', (done) => {
        const spy = jest.fn();

        class LocalMockClass {
            @Select('baz', spy)
            baz$: Observable<number>;
        }

        const mockInstance = new LocalMockClass();
        mockInstance.baz$.pipe(take(3)).subscribe({
            next: undefined,
            error: undefined,
            complete: done
        });

        ngRedux.dispatch({ type: 'nvm', payload: 1 });
        ngRedux.dispatch({ type: 'nvm', payload: 2 });

        expect(spy).toHaveBeenCalledWith(-1, 1);
        expect(spy).toHaveBeenCalledWith(1, 2);
    });
});

describe('@select$', () => {
    const transformer = (baz$: Observable<number>) =>
        baz$.pipe(map(baz => 2 * baz));

    test('applies a transformer to the observable', (done) => {
        class MockClass {
            @Select$('baz', transformer)
            baz$: Observable<number>;
        }

        const mockInstance = new MockClass();

        mockInstance.baz$
            .pipe(take(2), toArray())
            .subscribe({
                next: values => expect(values).toEqual([ -2, 10 ]),
                error: undefined,
                complete: done
            });
        ngRedux.dispatch({ type: 'nvm', payload: 5 });
    });

    describe('when passed a comparator', () => {
        const comparator = (_: any, y: any): boolean => y === 1;

        class MockClass {
            @Select$('baz', transformer, comparator)
            baz$: Observable<number>;
        }

        test('should only trigger next when the comparator returns true', (done) => {
            const mockInstance = new MockClass();
            mockInstance.baz$
                .pipe(take(2), toArray())
                .subscribe({
                    next: values => expect(values).toEqual([ -2, 2 ]),
                    error: undefined,
                    complete: done
                });
            ngRedux.dispatch({ type: 'nvm', payload: 1 });
            ngRedux.dispatch({ type: 'nvm', payload: 2 });
        });

        test('should receive previous and next value for comparison', (done) => {
            const spy = jest.fn();

            class SpyClass {
                @Select$('baz', transformer, spy)
                baz$: Observable<number>;
            }

            const mockInstance = new SpyClass();
            mockInstance.baz$.pipe(take(3)).subscribe({
                next: undefined,
                error: undefined,
                complete: done
            });

            ngRedux.dispatch({ type: 'nvm', payload: 1 });
            ngRedux.dispatch({ type: 'nvm', payload: 2 });

            expect(spy).toHaveBeenCalledWith(-2, 2);
            expect(spy).toHaveBeenCalledWith(2, 4);
        });
    });
});
