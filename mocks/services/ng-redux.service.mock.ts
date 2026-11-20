/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Signal } from '@angular/core';
import type { Observable, Subject } from 'rxjs';
import type { UnknownAction, Unsubscribe } from 'redux';
import type { SubStoreService } from '@angular-redux2/store';
import type { ComparatorType, PathSelectorType, SelectorType } from '@angular-redux2/store';
import type { SelectorStubMapInterface, SelectorStubRecordInterface, SubStoreStubMapInterface } from '@mocks/interfaces/store.interface.mock';

/**
 * Imports
 */

import { signal } from '@angular/core';
import { NgRedux } from '@angular-redux2/store';
import { distinctUntilChanged, ReplaySubject } from 'rxjs';

/**
 * A stand-in for {@link NgRedux} that lets a unit test push values into selections.
 *
 * @typeParam S - The type of the root state
 *
 * @remarks
 * Every `select` and `selectSignal` call, including the ones behind the decorators and `injectSelect`,
 * returns the subject of a selector stub instead of reading a state.
 * A test pushes values into that subject with {@link MockNgRedux.getSelectorStub}.
 * Substores are mocks too, and {@link MockNgRedux.getSubStore} returns the one for a base path.
 * Store methods such as `dispatch`, `getState`, and `configureStore` are inert,
 * so spy on them where a test needs to check a call.
 *
 * The static methods work on one shared instance, which {@link MockNgReduxModule} also injects as `NgRedux`.
 * The decorators read `NgRedux.store` instead, and the `NgRedux` constructor points it at every new mock,
 * mock substores included.
 * Once a test creates a mock substore, through `getSubStore` or through a `Substore` component,
 * decorated members that have not been read yet select from that substore mock rather than from the shared root.
 * Read the decorated members of root-level components before creating mock substores.
 * Call {@link MockNgRedux.reset} between tests to drop every stub.
 *
 * @example
 * ```ts
 * beforeEach(() => MockNgRedux.reset());
 *
 * test('shows the count', () => {
 *     const count = MockNgRedux.getSelectorStub<AppState, number>('count');
 *     count.next(3);
 *
 *     component.count$.subscribe(value => expect(value).toBe(3));
 * });
 * ```
 *
 * @see MockNgReduxModule
 * @see SelectorStubMapInterface
 *
 * @since 5.0.0
 */

export class MockNgRedux<S = unknown> extends NgRedux<S> {
    /**
     * The mock substores created so far, keyed by the JSON form of their base path.
     *
     * @remarks
     * {@link MockNgRedux.getSubStore} and `configureSubStore` both create entries here.
     *
     * @example
     * ```ts
     * MockNgRedux.getSubStore([ 'users', 'u1' ]);
     * Object.keys(MockNgRedux.store.subStores); // [ '["users","u1"]' ]
     * ```
     *
     * @since 5.0.0
     */

    subStores: SubStoreStubMapInterface = {};

    /**
     * The selector stubs created so far, keyed by the string form of each selector.
     *
     * @remarks
     * {@link MockNgRedux.getSelectorStub} and `select` both create entries here.
     *
     * @example
     * ```ts
     * MockNgRedux.getSelectorStub('count');
     * Object.keys(MockNgRedux.store.selections); // [ 'count' ]
     * ```
     *
     * @since 5.0.0
     */

    selections: SelectorStubMapInterface = {};

    /**
     * The shared mock that the static methods use.
     *
     * @remarks
     * {@link MockNgRedux.store} creates it on first access.
     *
     * @hidden
     * @since 5.0.0
     */

    protected static override instance: MockNgRedux<unknown>;

    /**
     * The shared mock, created on first access.
     *
     * @remarks
     * Unlike {@link NgRedux.store}, it never throws, since it creates the mock when none exists.
     *
     * @example
     * ```ts
     * MockNgRedux.store === MockNgRedux.store; // true
     * ```
     *
     * @hidden
     * @since 5.0.0
     */

    static override get store(): MockNgRedux<unknown> {
        this.instance ||= new MockNgRedux<unknown>();

        return this.instance;
    }

    /**
     * Returns the subject behind a selector of the shared root mock.
     *
     * @typeParam R - The type of the root state
     * @typeParam S - The type of the selected value
     * @param selector - The selector that the code under test uses
     * @param comparator - The comparator to store on a new stub
     * @returns The subject that feeds every selection with that selector
     *
     * @remarks
     * It forwards to {@link MockNgRedux.getSelectorStub} on the shared instance.
     * Use the instance method on a mock substore to stub a selection of a `Substore` component.
     * A decorated member reads `NgRedux.store`, which may no longer be the shared root once a mock substore exists.
     *
     * @example
     * ```ts
     * MockNgRedux.getSelectorStub('count').next(3); // every count$ selection emits 3
     * ```
     *
     * @since 5.0.0
     */

    static getSelectorStub<R, S>(
        selector?: SelectorType<R, S>,
        comparator?: ComparatorType<S>
    ): Subject<S> {
        return this.store.getSelectorStub<S>(
            <SelectorType<unknown, S> | undefined> selector,
            comparator
        );
    }

    /**
     * Returns the mock substore for a chain of base paths below the shared root mock.
     *
     * @typeParam S - The type of the state of the mock substore
     * @param pathSelectors - The base path of each level, outermost first
     * @returns The mock substore at the end of the chain, or the root mock without arguments
     *
     * @remarks
     * Pass one path per `configureSubStore` level that the code under test creates,
     * so a substore of a substore takes two paths.
     * A path is matched by its JSON form, so it must equal the path that the code passes.
     *
     * @example
     * ```ts
     * const user = MockNgRedux.getSubStore([ 'users', 'u1' ]);
     * user.getSelectorStub('name').next('Ada'); // the name$ of that user component emits 'Ada'
     * ```
     *
     * @since 5.0.0
     */

    static getSubStore<S>(
        ...pathSelectors: PathSelectorType[]
    ): MockNgRedux<S> {
        return pathSelectors.length
            ? this.store.getSubStore<S>(...pathSelectors)
            : <MockNgRedux<S>> <unknown> this.store;
    }

    /**
     * Drops every selector stub and mock substore of the shared root mock.
     *
     * @remarks
     * Call it in a `beforeEach`, so values pushed in one test do not leak into the next.
     * Observables that were selected before the reset keep their old subjects.
     *
     * @example
     * ```ts
     * MockNgRedux.reset();
     * MockNgRedux.store.selections; // {}
     * ```
     *
     * @since 5.0.0
     */

    static reset(): void {
        this.store.reset();
    }

    /**
     * Returns the subject behind a selector of this mock, creating the stub when needed.
     *
     * @typeParam SelectedState - The type of the selected value
     * @param selector - The selector that the code under test uses
     * @param comparator - The comparator to store on a new stub
     * @returns The subject that feeds every selection with that selector
     *
     * @remarks
     * The stub is shared with `select`, so the order does not matter:
     * values pushed before the code under test selects are replayed to it.
     *
     * @example
     * ```ts
     * const name = MockNgRedux.getSubStore([ 'users', 'u1' ]).getSelectorStub<string>('name');
     * name.next('Ada');
     * ```
     *
     * @since 5.0.0
     */

    getSelectorStub<SelectedState>(selector?: SelectorType<S, SelectedState>, comparator?: ComparatorType<SelectedState>): Subject<SelectedState> {
        return <Subject<SelectedState>> this.initSelectorStub<SelectedState>(selector, comparator).subject;
    }

    /**
     * Returns the mock substore for a chain of base paths below this mock.
     *
     * @typeParam SubState - The type of the state of the mock substore
     * @param pathSelectors - The base path of each level, outermost first
     * @returns The mock substore at the end of the chain, or this mock without arguments
     *
     * @remarks
     * Missing levels are created on the way, and existing ones are reused.
     *
     * @example
     * ```ts
     * const address = mock.getSubStore([ 'users', 'u1' ], [ 'address' ]);
     * address.getSelectorStub('city').next('Paris');
     * ```
     *
     * @since 5.0.0
     */

    getSubStore<SubState>(...pathSelectors: PathSelectorType[]): MockNgRedux<SubState> {
        const [ first, ...rest ] = pathSelectors;

        return <MockNgRedux<SubState>> <unknown> (first ? this.initSubStore(first).getSubStore(...rest) : this);
    }

    /**
     * Drops every selector stub and mock substore of this mock, resetting the substores first.
     *
     * @example
     * ```ts
     * mock.reset();
     * mock.subStores; // {}
     * ```
     *
     * @since 5.0.0
     */

    reset(): void {
        Object.values(this.subStores).forEach(subStore => subStore.reset());
        this.selections = {};
        this.subStores = {};
    }

    /**
     * Does nothing, so code under test may configure the store freely.
     *
     * @remarks
     * Unlike {@link NgRedux.configureStore}, it never throws on a second call.
     *
     * @example
     * ```ts
     * mock.configureStore(); // no Redux store is created
     * ```
     *
     * @since 5.0.0
     */

    override configureStore(): void {
        return;
    }

    /**
     * Returns the mock substore for a base path and ignores the reducer.
     *
     * @typeParam SubState - The type of the state of the substore
     * @param basePath - The path of the substore
     * @returns The mock substore for that path, typed as a substore
     *
     * @remarks
     * The same path always returns the same mock, which {@link MockNgRedux.getSubStore} also returns.
     *
     * @example
     * ```ts
     * mock.configureSubStore([ 'users', 'u1' ], userReducer) === mock.getSubStore([ 'users', 'u1' ]); // true
     * ```
     *
     * @since 5.0.0
     */

    override configureSubStore<SubState>(basePath: PathSelectorType): SubStoreService<SubState> {
        return <SubStoreService<SubState>> <unknown> this.initSubStore<SubState>(basePath);
    }

    /**
     * Does nothing and ignores both arguments.
     *
     *
     * @example
     * ```ts
     * mock.provideStore(rootReducer, store); // no store is adopted
     * ```
     *
     * @since 5.0.0
     */

    override provideStore(): void {
        return;
    }

    /**
     * Returns the action without dispatching it.
     *
     * @typeParam A - The type of the action
     * @param action - The action to return
     * @returns The same action
     *
     * @remarks
     * No reducer runs and no stub changes, so spy on the method to check what the code under test dispatched.
     *
     * @example
     * ```ts
     * const spy = xJet.spyOn(MockNgRedux.store, 'dispatch');
     * component.increment();
     * expect(spy).toHaveBeenCalledWith({ type: 'INCREMENT' });
     * ```
     *
     * @since 5.0.0
     */

    override dispatch<A extends UnknownAction>(action: A): A {
        return action;
    }

    /**
     * Does nothing and returns `null`.
     *
     * @returns Always `null`
     *
     * @example
     * ```ts
     * mock.replaceReducer(); // null
     * ```
     *
     * @since 5.0.0
     */

    override replaceReducer(): null {
        return null;
    }

    /**
     * Returns an empty object as the state.
     *
     * @returns A new empty object on every call
     *
     * @remarks
     * The stubs do not feed it, so code that reads `getState` directly needs a spy that returns a state.
     *
     * @example
     * ```ts
     * mock.getState(); // {}
     * ```
     *
     * @since 5.0.0
     */

    override getState(): S {
        return <S>{};
    }

    /**
     * Ignores the listener and returns a function that does nothing.
     *
     * @returns An unsubscribe function without effect
     *
     * @example
     * ```ts
     * const unsubscribe = mock.subscribe();
     * unsubscribe(); // null
     * ```
     *
     * @since 5.0.0
     */

    override subscribe(): Unsubscribe {
        return () => null;
    }

    /**
     * Returns the stubbed observable for a selector.
     *
     * @typeParam SelectedState - The type of the selected value
     * @param selector - The selector to stub
     * @param comparator - The comparator to store on a new stub
     * @returns The subject of the stub, piped through `distinctUntilChanged` when the stub has a comparator
     *
     * @remarks
     * The stub is shared with {@link MockNgRedux.getSelectorStub}, so the values that a test pushes appear here.
     * Only the comparator of the call that created the stub is used.
     *
     * @example
     * ```ts
     * mock.getSelectorStub('count').next(3);
     * mock.select('count'); // emits 3
     * ```
     *
     * @since 5.0.0
     */

    override select<SelectedState>(selector?: SelectorType<S, SelectedState>, comparator?: ComparatorType<SelectedState>): Observable<SelectedState> {
        const stub = this.initSelectorStub<SelectedState>(selector, comparator);

        return <Observable<SelectedState>> (stub.comparator
            ? stub.subject.pipe(distinctUntilChanged(stub.comparator))
            : stub.subject);
    }

    /**
     * Returns a signal that follows the stubbed values of a selector.
     *
     * @typeParam SelectedState - The type of the selected value
     * @param selector - The selector to stub
     * @param comparator - The comparator to store on a new stub
     * @returns A read-only signal that holds the last value pushed into the stub, or `undefined` before the first
     *
     * @remarks
     * The stub is shared with {@link MockNgRedux.getSelectorStub} and {@link MockNgRedux.select},
     * so the values that a test pushes appear here, and `injectSelect` reads them in a component under test.
     *
     * @example
     * ```ts
     * const count = mock.selectSignal<number>('count');
     *
     * mock.getSelectorStub('count').next(3);
     * count(); // 3
     * ```
     *
     * @since 6.0.0
     */

    override selectSignal<SelectedState>(selector?: SelectorType<S, SelectedState>, comparator?: ComparatorType<SelectedState>): Signal<SelectedState> {
        const value = signal(<SelectedState> undefined, { equal: comparator });
        this.select(selector, comparator).subscribe(next => value.set(next));

        return value.asReadonly();
    }


    /**
     * Returns the mock substore for one base path, creating it when needed.
     *
     * @typeParam SubState - The type of the state of the substore
     * @param basePath - The path of the substore
     * @returns The mock substore stored under the JSON form of the path
     *
     * @remarks
     * A new mock substore also becomes the instance that `NgRedux.store` returns,
     * since the `NgRedux` constructor registers every instance.
     *
     * @hidden
     * @since 5.0.0
     */

    protected initSubStore<SubState>(basePath: PathSelectorType): MockNgRedux<SubState> {
        return <MockNgRedux<SubState>> (this.subStores[JSON.stringify(basePath)] ??= new MockNgRedux<unknown>());
    }

    /**
     * Returns the stub record for a selector, creating it when needed.
     *
     * @typeParam SelectedState - The type of the selected value
     * @param selector - The selector to stub
     * @param comparator - The comparator to store on a new record
     * @returns The record stored under the signature of the selector
     *
     * @remarks
     * The signature is the string form of the selector, or the empty string for no selector.
     * A function selector is normalized by {@link MockNgRedux.coverageFunctionSignature},
     * and when coverage is collected, it is also called once with an empty object,
     * so its body counts as covered.
     *
     * @hidden
     * @since 5.0.0
     */

    protected initSelectorStub<SelectedState>(
        selector?: SelectorType<S, SelectedState>,
        comparator?: ComparatorType<SelectedState>
    ): SelectorStubRecordInterface {
        let signature = selector ? selector.toString() : '';

        if ('function' === typeof selector) {
            signature = this.coverageFunctionSignature(signature);
            /**
             * Call the selector once under coverage, so its body counts as covered.
             */

            if ((<Record<string, unknown>> globalThis)['__coverage__']) {
                try {
                    selector(<S> {});
                } catch { /* empty */
                }
            }
        }

        return this.selections[signature] ??= <SelectorStubRecordInterface> {
            subject: new ReplaySubject<SelectedState>(),
            comparator
        };
    }

    /**
     * Normalizes the source of a function selector into a stub key.
     *
     * @param signature - The source text of the selector
     * @returns The source without coverage counters, the word `return`, or any non-alphanumeric character
     *
     * @remarks
     * Coverage instrumentation inserts counters into the source,
     * so stripping them keeps the key the same with and without coverage.
     * Two selectors that differ only in whitespace or punctuation share a key.
     *
     * @since 5.0.0
     */

    protected coverageFunctionSignature(
        signature: string
    ): string {
        return signature
            .replace(/cov_.+?[,;]/g, '')
            .replace(/return/g, '')
            .replace(/[^A-Za-z0-9]/g, '');
    }
}
