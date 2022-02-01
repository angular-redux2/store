/**
 * Imports third-party libraries
 */

import { NgZone } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { createStore, Reducer, Action, AnyAction, Store } from 'redux';

/**
 * NgRedux
 */

import { NgRedux } from './ng-redux.service';

/**
 * Import Decorators
 */

import { Select } from '../decorators/select.decorator';

/**
 * Zone
 */

class MockNgZone extends NgZone {
    override run<T>(fn: (...args: any[]) => T): T {
        return fn() as T;
    }
}

/**
 * Action
 */

type PayloadAction = Action & { payload?: string | number };

/**
 * Root store
 */

describe('NgRedux Observable Store', () => {
    /**
     * Interfaces
     */

    interface IAppState {
        foo: string;
        bar: string;
        baz: number;
    }

    /**
     * Create test store
     */

    let defaultState: IAppState;
    let rootReducer: Reducer<IAppState, AnyAction>;
    let store: Store<IAppState>;
    let ngRedux: NgRedux<IAppState>;
    const mockNgZone = new MockNgZone({ enableLongStackTrace: false }) as NgZone;

    /**
     * Before each test
     */

    beforeEach(() => {
        defaultState = {
            foo: 'bar',
            bar: 'foo',
            baz: -1,
        };

        rootReducer = (state = defaultState, action: PayloadAction) => {
            switch (action.type) {
                case 'UPDATE_FOO':
                    return Object.assign({}, state, { foo: action.payload });
                case 'UPDATE_BAZ':
                    return Object.assign({}, state, { baz: action.payload });
                case 'UPDATE_BAR':
                    return Object.assign({}, state, { bar: action.payload });
                default:
                    return state;
            }
        };

        store = createStore(rootReducer);
        ngRedux = new NgRedux<IAppState>(mockNgZone);
        ngRedux.configureStore(rootReducer, defaultState);
    });

    /**
     * Configured once in beforeEach, now we try to configure,
     * test is a second time.
     */

    test('should throw when the store is configured twice', () => {
        expect(
            ngRedux.configureStore.bind(ngRedux, rootReducer, defaultState)
        ).toThrowError(Error);
    });

    test('should get the initial state', (done) => {
        ngRedux.select<any>().subscribe((state: IAppState) => {
            expect(state.foo).toBe('bar');
            expect(state.baz).toBe(-1);
            done();
        });
    });

    test('should accept a key-name for a selector', (done) => {
        ngRedux.select<any>('foo').subscribe(stateSlice => {
            expect(stateSlice).toBe('bar');
            done();
        });
    });

    test('NgRedux ReplaySubject', () => {
        let fooData = '';

        const spy = jest.fn();

        ngRedux.dispatch({ type: 'UPDATE_FOO', payload: 0 });
        ngRedux.dispatch({ type: 'UPDATE_FOO', payload: 1 });

        const foo$ = ngRedux.select<any>('foo').subscribe(spy);
        expect(spy).toBeCalledTimes(1);
    });

    test('should not trigger selector if that slice of state wasnt changed', () => {
        let fooData = '';

        const spy = jest.fn((foo: string) => {
            fooData = foo;
        });

        const foo$ = ngRedux.select<any>('foo').subscribe(spy);
        expect(spy).toBeCalled();

        ngRedux.dispatch({ type: 'UPDATE_BAR', payload: 0 });
        expect(spy).toBeCalledTimes(1);
        expect(fooData).toBe('bar');

        ngRedux.dispatch({ type: 'UPDATE_FOO', payload: 'changeFoo' });
        expect(spy).toBeCalledTimes(2);
        expect(fooData).toBe('changeFoo');
        foo$.unsubscribe();
    });

    test('should not trigger a selector if the action payload is the same', () => {
        let fooData = '';

        const spy = jest.fn((foo: string) => {
            fooData = foo;
        });

        const foo$ = ngRedux.select<any>('foo').subscribe(spy);

        expect(spy).toBeCalled();
        expect(fooData).toBe('bar');
        ngRedux.dispatch({ type: 'UPDATE_FOO', payload: 'bar' });
        expect(spy).toBeCalledTimes(1);
        expect(fooData).toBe('bar');
        foo$.unsubscribe();
    });

    test('should not call sub if the result of the function is the same', () => {
        let fooData = '';

        const spy = jest.fn((foo: string) => {
            fooData = foo;
        });

        ngRedux.select<any>((state: any) => `${ state.foo }-${ state.baz }`).subscribe(spy);

        expect(spy).toBeCalled();
        expect(fooData).toBe('bar--1');

        expect(spy).toBeCalledTimes(1);
        expect(fooData).toBe('bar--1');

        ngRedux.dispatch({ type: 'UPDATE_BAR', payload: 'bar' });
        expect(spy).toBeCalledTimes(1);
        expect(fooData).toBe('bar--1');

        ngRedux.dispatch({ type: 'UPDATE_FOO', payload: 'update' });
        expect(fooData).toBe('update--1');
        expect(spy).toBeCalledTimes(2);

        ngRedux.dispatch({ type: 'UPDATE_BAZ', payload: 2 });
        expect(fooData).toBe('update-2');
        expect(spy).toBeCalledTimes(3);
    });

    test('should only call provided select function if state changed', () => {
        const selectSpy = jest.fn((state: IAppState) => state.foo);
        ngRedux.select().subscribe(<any>selectSpy);

        // called once to get the initial value
        expect(selectSpy).toBeCalledTimes(1);

        // not called since no state was updated
        ngRedux.dispatch({ type: 'NOT_A_STATE_CHANGE' });
        expect(selectSpy).toBeCalledTimes(1);

        ngRedux.dispatch({ type: 'UPDATE_FOO', payload: 'update' });
        expect(selectSpy).toBeCalledTimes(2);

        ngRedux.dispatch({ type: 'NOT_A_STATE_CHANGE' });
        expect(selectSpy).toBeCalledTimes(2);
    });

    /**
     * Configured once in beforeEach, now we try to provide a store when
     * we already have configured one.
     */

    test('should throw if store is provided after it has been configured', () => {
        expect(ngRedux.provideStore.bind(store)).toThrowError();
    });

    test('should wait until store is configured before emitting values', () => {
        class SomeService {
            foo!: string;
            bar!: string;
            baz!: number;

            constructor(_ngRedux: NgRedux<any>) {
                _ngRedux.select((n: any) => n.foo).subscribe((foo: any) => (this.foo = foo));
                _ngRedux.select((n: any) => n.bar).subscribe((bar: any) => (this.bar = bar));
                _ngRedux.select((n: any) => n.baz).subscribe((baz: any) => (this.baz = baz));
            }
        }

        ngRedux = new NgRedux<IAppState>(mockNgZone);
        const someService = new SomeService(ngRedux);
        ngRedux.configureStore(rootReducer, defaultState);

        expect(someService.foo).toBe('bar');
        expect(someService.bar).toBe('foo');
        expect(someService.baz).toBe(-1);
    });

    test('should have select decorators work before store is configured', () => {
        class SomeService {
            @Select() foo$: Observable<string>;
            @Select() bar$: Observable<string>;
            @Select() baz$: Observable<string>;
        }

        ngRedux = new NgRedux<IAppState>(mockNgZone);
        const someService = new SomeService();

        combineLatest([ someService.foo$, someService.bar$, someService.baz$ ])
            .subscribe(([ foo, bar, baz ]) => {
                expect(foo).toBe('bar');
                expect(bar).toBe('foo');
                expect(baz).toBe(-1);
            });

        ngRedux.configureStore(rootReducer, defaultState);
    });
});

describe('Chained actions in subscriptions', () => {
    /**
     * Interfaces
     */

    interface IAppState {
        keyword: string;
        keywordLength: number;
    }

    let defaultState: IAppState;
    let rootReducer: Reducer<IAppState, AnyAction>;
    let ngRedux: NgRedux<IAppState>;
    const mockNgZone = new MockNgZone({ enableLongStackTrace: false }) as NgZone;

    /**
     * Create test store
     */

    const doSearch = (word: string) =>
        ngRedux.dispatch({ type: 'SEARCH', payload: word });
    const doFetch = (word: string) =>
        ngRedux.dispatch({ type: 'SEARCH_RESULT', payload: word.length });

    /**
     * Before each test
     */

    beforeEach(() => {
        defaultState = {
            keyword: '',
            keywordLength: -1,
        };

        rootReducer = (state = defaultState, action: PayloadAction) => {
            switch (action.type) {
                case 'SEARCH':
                    return Object.assign({}, state, { keyword: action.payload });
                case 'SEARCH_RESULT':
                    return Object.assign({}, state, { keywordLength: action.payload });
                default:
                    return state;
            }
        };

        ngRedux = new NgRedux<IAppState>(mockNgZone);
        ngRedux.configureStore(rootReducer, defaultState);
    });

    describe('dispatching an action in a keyword$ before length$ happens', () => {
        test('length sub should be called twice', () => {
            let lenSub;
            let keywordSub;

            const lengthSpy = jest.fn();
            const keywordSpy = jest.fn();
            const keyword$ = ngRedux.select((n: any) => n.keyword);
            const length$ = ngRedux.select((n: any) => n.keywordLength);

            lenSub = length$.subscribe(lengthSpy);
            keywordSub = keyword$.subscribe(keywordSpy);

            expect(lengthSpy).toBeCalledWith(-1);
            expect(keywordSpy).toBeCalledWith('');

            doSearch('test');
            doFetch('test');

            expect(lengthSpy).toBeCalledWith(4);
            expect(keywordSpy).toBeCalledWith('test');

            keywordSub.unsubscribe();
            lenSub.unsubscribe();
        });
    });
});
