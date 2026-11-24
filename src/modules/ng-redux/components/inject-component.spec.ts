/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction } from 'redux';

/**
 * Imports
 */

import { NgRedux } from '@services/ng-redux.service';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { injectSelect, injectSubstore } from '@ng-redux/components/inject.component';

/**
 * Tests
 */

interface StateInterface {
    counter: number;
    users: Record<string, { loc: number }>;
}

function createInjector(): Injector {
    const ngRedux = new NgRedux<StateInterface>({
        reducer: (state = { counter: 0, users: { bob: { loc: 1 }, alice: { loc: 2 } } }) => state
    });

    return Injector.create({ providers: [{ provide: NgRedux, useValue: ngRedux }] });
}

function locReducer(state = { loc: 0 }, action: UnknownAction): { loc: number } {
    return action.type === 'ADD_LOC' ? { loc: state.loc + 1 } : state;
}

describe('injectSelect', () => {
    test('should select from the injected store', () => {
        const count = runInInjectionContext(createInjector(), () => injectSelect((state: StateInterface) => state.counter));

        expect(count()).toBe(0);
    });

    test('should pass the options to the selection', () => {
        const keys = runInInjectionContext(createInjector(), () => injectSelect(
            (state: StateInterface) => Object.keys(state.users),
            { equal: (previous, next) => previous.join() === next.join() }
        ));

        expect(keys()).toEqual([ 'bob', 'alice' ]);
    });

    test('should throw outside an injection context', () => {
        expect(() => injectSelect((state: StateInterface) => state.counter)).toThrow();
    });
});

describe('injectSubstore', () => {
    test('should create a substore on the injected store', () => {
        const injector = createInjector();
        const bob = runInInjectionContext(injector, () => injectSubstore([ 'users', 'bob' ], locReducer));

        bob.dispatch({ type: 'ADD_LOC' });

        expect(injector.get(NgRedux<StateInterface>).getState().users['bob'].loc).toBe(2);
    });

    test('should destroy the substore with its injector', () => {
        const parent = createInjector();
        const child = Injector.create({ providers: [], parent });
        const ngRedux = parent.get(NgRedux);
        runInInjectionContext(child, () => injectSubstore([ 'users', 'bob' ], (state: unknown = null) => state));

        expect((<any> ngRedux).substoreReducers.size).toBe(1);
        (<{ destroy(): void }> <unknown> child).destroy();
        expect((<any> ngRedux).substoreReducers.size).toBe(0);
    });

    test('should follow a computed path', () => {
        const userId = signal('bob');
        const user = runInInjectionContext(createInjector(), () => injectSubstore(() => [ 'users', userId() ], locReducer));

        userId.set('alice');

        expect(user.getState()).toEqual({ loc: 2 });
    });
});
