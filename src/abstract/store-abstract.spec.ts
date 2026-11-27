/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Unsubscribe } from 'redux';
import type { SubStoreInterface } from '../interfaces/store.interface';

/**
 * Imports
 */

import { AbstractStore } from './store.abstract';
import { computed, signal } from '@angular/core';

/**
 * Tests
 */

class TestStore<State> extends AbstractStore<State> {
    readonly source: ReturnType<typeof signal<State>>;
    readonly state;
    private readonly listeners = new Set<() => void>();

    constructor(initial: State) {
        super();
        this.source = signal(initial);
        this.state = this.source.asReadonly();
    }

    dispatch<DispatchedAction>(action: DispatchedAction): DispatchedAction {
        return action;
    }

    substore<SubState>(): SubStoreInterface<SubState> {
        throw new Error('not used');
    }

    set(state: State): void {
        this.source.set(state);
        this.listeners.forEach(listener => listener());
    }

    protected listen(listener: () => void): Unsubscribe {
        this.listeners.add(listener);

        return () => this.listeners.delete(listener);
    }
}

describe('AbstractStore', () => {
    describe('getState', () => {
        test('should return the current state', () => {
            expect(new TestStore({ count: 1 }).getState()).toEqual({ count: 1 });
        });

        test('should not make a computed that calls it rerun on the next change', () => {
            const store = new TestStore({ count: 1 });
            let runs = 0;
            const read = computed(() => {
                runs++;

                return store.getState().count;
            });

            read();
            store.set({ count: 2 });
            read();

            expect(runs).toBe(1);
        });
    });

    describe('select', () => {
        test('should run the selector lazily, only when read after a change', () => {
            const store = new TestStore({ count: 1 });
            const selector = xJet.fn((state: { count: number }) => state.count);
            const count = store.select(selector);

            expect(selector).not.toHaveBeenCalled();
            count();
            count();
            expect(selector).toHaveBeenCalledTimes(1);
        });

        test('should keep the previous value while equal calls the new one equal', () => {
            const store = new TestStore({ list: [ 1 ] });
            const list = store.select(state => [ ...state.list ], { equal: (a, b) => a.join() === b.join() });
            const first = list();

            store.set({ list: [ 1 ] });

            expect(list()).toBe(first);
        });
    });

    describe('select$', () => {
        test('should emit only the values that equal calls different', () => {
            const store = new TestStore({ name: 'Ada' });
            const values: Array<string> = [];
            store.select$(state => state.name, { equal: (a, b) => a.toLowerCase() === b.toLowerCase() })
                .subscribe(value => values.push(value));

            store.set({ name: 'ADA' });
            store.set({ name: 'Bob' });

            expect(values).toEqual([ 'Ada', 'Bob' ]);
        });

        test('should give each subscription its own listener', () => {
            const store = new TestStore({ count: 0 });
            const first: Array<number> = [];
            const second: Array<number> = [];
            const subscription = store.select$(state => state.count).subscribe(value => first.push(value));
            store.select$(state => state.count).subscribe(value => second.push(value));

            subscription.unsubscribe();
            store.set({ count: 1 });

            expect(first).toEqual([ 0 ]);
            expect(second).toEqual([ 0, 1 ]);
        });
    });
});
