/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction } from 'redux';

/**
 * Imports
 */

import { createStore } from 'redux';
import { NgRedux } from '@services/ng-redux.service';
import { injectSelect } from '@modules/ng-redux.inject';
import { Substore } from '@decorators/substore.decorator';
import { SelectSignal } from '@decorators/select.decorator';
import { Injector, runInInjectionContext } from '@angular/core';

/**
 * Tests
 */

interface StateInterface {
    count: number;
    users: Record<string, { name: string }>;
}

const INITIAL_STATE: StateInterface = { count: 0, users: { ada: { name: 'Ada' }, bob: { name: 'Bob' } } };

function reducer(state: StateInterface = INITIAL_STATE, action: UnknownAction): StateInterface {
    switch (action.type) {
        case 'INCREMENT':
            return { ...state, count: state.count + 1 };
        case 'RENAME':
            return { ...state, users: { ...state.users, ada: { name: <string> action['name'] } } };
        default:
            return state;
    }
}

function configure(): NgRedux<StateInterface> {
    const ngRedux = new NgRedux<StateInterface>();
    ngRedux.configureStore(reducer, INITIAL_STATE);

    return ngRedux;
}

describe('NgRedux.selectSignal', () => {
    test('should read undefined before the store is configured, without calling the selector', () => {
        const selector = xJet.fn((state: StateInterface) => state.count);
        const count = new NgRedux<StateInterface>().selectSignal(selector);

        expect(count()).toBeUndefined();
        expect(selector).not.toHaveBeenCalled();
    });

    test('should follow the state after each dispatch', () => {
        const ngRedux = configure();
        const count = ngRedux.selectSignal<number>('count');
        const doubled = ngRedux.selectSignal((state: StateInterface) => state.count * 2);

        ngRedux.dispatch({ type: 'INCREMENT' });
        ngRedux.dispatch({ type: 'INCREMENT' });

        expect(count()).toBe(2);
        expect(doubled()).toBe(4);
    });

    test('should keep the previous value while the comparator calls the new one equal', () => {
        const ngRedux = configure();
        const user = ngRedux.selectSignal([ 'users', 'ada' ], (previous: any, next: any) => previous.name === next.name);
        const first = user();

        ngRedux.dispatch({ type: 'RENAME', name: 'Ada' });

        expect(user()).toBe(first);
    });
});

describe('NgRedux.replaceStore', () => {
    test('should move every selection to the new store and stop listening to the old one', () => {
        const ngRedux = configure();
        const previous = (<any> ngRedux).reduxStore;
        const seen: Array<number> = [];
        const count = ngRedux.selectSignal<number>('count');
        ngRedux.select<number>('count').subscribe(value => seen.push(value));

        ngRedux.replaceStore(createStore(reducer, { ...INITIAL_STATE, count: 10 }));
        ngRedux.dispatch({ type: 'INCREMENT' });
        previous.dispatch({ type: 'INCREMENT' });

        expect(count()).toBe(11);
        expect(ngRedux.getState().count).toBe(11);
        expect(seen).toEqual([ 0, 10, 11 ]);
    });
});

describe('SubStoreService.selectSignal', () => {
    test('should select relative to the base path and follow it when it moves', () => {
        const ngRedux = configure();
        const subStore = ngRedux.configureSubStore<{ name: string }>([ 'users', 'ada' ], state => state!);
        const name = subStore.selectSignal<string>('name');

        expect(name()).toBe('Ada');

        ngRedux.dispatch({ type: 'RENAME', name: 'Grace' });
        expect(name()).toBe('Grace');

        subStore.setBasePath([ 'users', 'bob' ]);
        expect(name()).toBe('Bob');
    });
});

describe('injectSelect', () => {
    test('should select from the injected store', () => {
        const ngRedux = configure();
        const injector = Injector.create({ providers: [{ provide: NgRedux, useValue: ngRedux }] });
        const count = runInInjectionContext(injector, () => injectSelect<number>('count'));

        ngRedux.dispatch({ type: 'INCREMENT' });

        expect(count()).toBe(1);
    });

    test('should throw outside an injection context', () => {
        expect(() => injectSelect('count')).toThrow();
    });
});

describe('SelectSignal', () => {
    test('should select the property name and follow the state', () => {
        const ngRedux = configure();

        class CounterComponent {
            @SelectSignal() readonly count: () => number;
        }

        const component = new CounterComponent();
        ngRedux.dispatch({ type: 'INCREMENT' });

        expect(component.count()).toBe(1);
        expect(component.count).toBe(component.count);
    });

    test('should select a path, with a comparator that keeps the previous value', () => {
        const ngRedux = configure();

        class UserComponent {
            @SelectSignal([ 'users', 'ada' ], (previous: any, next: any) => previous.name === next.name)
            readonly user: () => { name: string };
        }

        const component = new UserComponent();
        const first = component.user();
        ngRedux.dispatch({ type: 'RENAME', name: 'Ada' });

        expect(component.user()).toBe(first);
    });

    test('should select from the substore of a Substore class', () => {
        configure();

        @Substore((state: { name: string } = { name: '' }) => state)
        class UserComponent {
            @SelectSignal() readonly name: () => string;

            basePath(): Array<string> {
                return [ 'users', 'bob' ];
            }
        }

        expect(new UserComponent().name()).toBe('Bob');
    });
});
