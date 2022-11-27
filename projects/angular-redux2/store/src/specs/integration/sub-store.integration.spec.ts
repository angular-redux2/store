/**
 * Import third-party libraries
 */

import { NgZone } from '@angular/core';
import { take, toArray } from 'rxjs/operators';
import { Action, AnyAction, Reducer } from 'redux';

/**
 * Services
 */

import { NgRedux } from '../../services/ng-redux.service';
import { SubStoreService } from '../../services/sub-store.service';

/**
 * Interfaces
 */

import { ACTION_KEY } from "../../interfaces/fractal.interface";

/**
 * Initialize global test invariant variable
 */

class MockNgZone extends NgZone {
    override run<T>(fn: (...args: any[]) => T): T {
        return fn() as T;
    }
}

interface ISubState {
    level3: {
        level4: number;
    };
}

interface IAppState {
    foo: {
        bar: ISubState;
    };
}

describe('NgRedux Sub-store functional', () => {
    /**
     * Initialize scope test invariant variable
     */

    const basePath = [ 'foo', 'bar' ];
    const rootReducer = (state: any, _: Action) => state;
    const defaultReducer = jest.fn();

    let ngRedux: NgRedux<IAppState>;
    let subStore: SubStoreService<ISubState>;

    /**
     * Before each test
     */

    beforeAll(() => {
        ngRedux = new NgRedux<IAppState>(new MockNgZone({
            enableLongStackTrace: false,
        }) as NgZone);

        ngRedux.configureStore(rootReducer, {
            foo: {
                bar: {
                    level3: {
                        level4: 3
                    }
                },
            },
        });

        subStore = ngRedux.configureSubStore<ISubState>(basePath, defaultReducer);
    });

    test('Should gets state rooted at the base path.', () => {
        expect(subStore.getState()).toStrictEqual({
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

        nonExistentSubStore.dispatch<AnyAction>({
            type: 'nvm',
            newValue: 'now I exist',
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

        nonExistentSubStore.dispatch<AnyAction>({
            type: 'nvm',
            newValue: 'now I exist',
        });
    });

    test('Should handles function selection on a base path that doesn\'t exist yet', () => {
        const nonExistentSubStore = ngRedux.configureSubStore(
            [ 'sure', 'whatever' ],
            (state: any, action: any) => ({ ...state, value: action.newValue })
        );
        nonExistentSubStore
            .select(s => (s ? s.value : s))
            .pipe(take(2), toArray())
            .subscribe(v => {
                expect(v).toEqual([ undefined, 'now I exist' ]);
            });

        nonExistentSubStore.dispatch<AnyAction>({
            type: 'nvm',
            newValue: 'now I exist',
        });
    });

    test('Should create its own sub-store', () => {
        const subSubStore = subStore.configureSubStore([ 'level3' ], defaultReducer);

        expect(subSubStore.getState()).toEqual({ level4: 3 });
        subSubStore.dispatch<AnyAction>({ type: 'MY_ACTION' });

        expect(defaultReducer).toBeCalledWith({ level4: 3 }, {
            type: 'MY_ACTION',
            [ACTION_KEY]: {
                hash: -1826428781,
                path: [ 'foo', 'bar', 'level3' ]
            },
        });
    });
});
