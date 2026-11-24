/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { EnvironmentInjector, EnvironmentProviders, Provider } from '@angular/core';

/**
 * Imports
 */

import { NgRedux } from '@services/ng-redux.service';
import { createSlice } from '@components/slice.component';
import { STATE_KEY } from '@ng-redux/constants/ng-redux.constant';
import { createEnvironmentInjector, Injector, TransferState } from '@angular/core';
import { provideNgRedux, provideNgReduxFeature } from '@ng-redux/providers/ng-redux.provider';

/**
 * Tests
 */

interface StateInterface {
    counter: number;
    todos?: Array<string>;
}

const INITIAL_STATE: StateInterface = { counter: 0 };

function reducer(state: StateInterface = INITIAL_STATE, action: { type: string }): StateInterface {
    return action.type === 'INCREMENT' ? { ...state, counter: state.counter + 1 } : state;
}

const todos = createSlice('todos', <Array<string>> [], {
    add(state, title: string) {
        state.push(title);
    }
});

function start(...providers: Array<Provider | EnvironmentProviders>): EnvironmentInjector {
    return createEnvironmentInjector(providers, <EnvironmentInjector> Injector.create({ providers: [] }));
}

describe('provideNgRedux', () => {
    test('should provide a store that is ready on first injection', () => {
        const ngRedux = start(provideNgRedux({ reducer, initialState: INITIAL_STATE })).get(NgRedux<StateInterface>);

        expect(ngRedux.getState()).toBe(INITIAL_STATE);
        ngRedux.dispatch({ type: 'INCREMENT' });
        expect(ngRedux.state().counter).toBe(1);
    });

    test('should provide one store for the whole injector', () => {
        const injector = start(provideNgRedux({ reducer }));

        expect(injector.get(NgRedux)).toBe(injector.get(NgRedux));
    });

    describe('transferState', () => {
        test('should start from the state that the server transferred', () => {
            const transfer = new TransferState();
            transfer.set(STATE_KEY, { counter: 7 });

            const ngRedux = start(
                { provide: TransferState, useValue: transfer },
                provideNgRedux({ reducer, initialState: INITIAL_STATE, transferState: true })
            ).get(NgRedux<StateInterface>);

            expect(ngRedux.getState()).toEqual({ counter: 7 });
        });

        test('should start from the initial state when nothing was transferred', () => {
            const ngRedux = start(
                { provide: TransferState, useValue: new TransferState() },
                provideNgRedux({ reducer, initialState: INITIAL_STATE, transferState: true })
            ).get(NgRedux<StateInterface>);

            expect(ngRedux.getState()).toBe(INITIAL_STATE);
        });

        test('should hand the current state to the transfer when the page is serialized', () => {
            const transfer = new TransferState();
            const ngRedux = start(
                { provide: TransferState, useValue: transfer },
                provideNgRedux({ reducer, initialState: INITIAL_STATE, transferState: true })
            ).get(NgRedux<StateInterface>);

            ngRedux.dispatch({ type: 'INCREMENT' });

            expect(JSON.parse(transfer.toJson())).toEqual({ [STATE_KEY]: { counter: 1 } });
        });
    });
});

describe('provideNgReduxFeature', () => {
    test('should add the slice reducer under its name when the injector starts', () => {
        const root = start(provideNgRedux({ reducer, initialState: INITIAL_STATE }));
        createEnvironmentInjector([ provideNgReduxFeature(todos) ], root);
        const ngRedux = root.get(NgRedux<StateInterface>);

        ngRedux.dispatch(todos.actions.add('a'));

        expect(ngRedux.getState().todos).toEqual([ 'a' ]);
    });
});
