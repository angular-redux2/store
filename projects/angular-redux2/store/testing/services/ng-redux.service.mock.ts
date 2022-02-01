/**
 * Imports third-party libraries
 */

import { AnyAction, Reducer, Store, Unsubscribe } from 'redux';
import { distinctUntilChanged, Observable, ReplaySubject, Subject } from 'rxjs';

/**
 * Import NgRedux
 */

import { NgRedux, Comparator, PathSelector, Selector, StoreInterface } from '@angular-redux2/store';

/**
 * Interfaces
 */

export interface SelectorStubRecord {
    subject: Subject<any>;
    comparator: Comparator;
}

export interface SelectorStubMap {
    [selector: string]: SelectorStubRecord;
}

export interface SubStoreStubMap {
    [basePath: string]: MockNgRedux<any>;
}

/**
 * This is the public of `@angular-redux2/store`.
 * It wraps the global redux store and adds a few others add on methods.
 * It's what you'll inject into your Angular application as a service.
 *
 * `Convenience mock to make it easier to control selector behaviour in unit tests.`
 */

export class MockNgRedux<State = {}> extends NgRedux<any> {
    /**
     * Mock substore
     */

    subStores: SubStoreStubMap = {};

    /**
     * Mock selectors
     */

    selections: SelectorStubMap = {};

    /**
     * Returns a subject that's connected to any observable returned by the
     * given selector. You can use this subject to pump values into your
     * components or services under test; when they call .select or @select
     * in the context of a unit test, MockNgRedux will give them the values
     * you pushed onto your stub.
     *
     * ```typescript
     *   it('select ticket price data from the substore', async(() => {
     *     const mockSubStore = MockNgRedux.getSubStore(
     *       ['WALLABIES', 'items', 'id1']);
     *
     *     const selectorStub = mockSubStore.getSelectorStub('ticketPrice');
     *     selectorStub.next(2);
     *     selectorStub.complete();
     *
     *     animalComponent.ticketPrice$
     *       .subscribe(
     *         ticketPrice => expect(ticketPrice).toEqual(2));
     *   }));
     * ```
     */

    static getSelectorStub<R, S>(
        selector?: Selector<R, S>,
        comparator?: Comparator
    ): Subject<S> {
        return MockNgRedux.store.getSelectorStub<S>(
            selector,
            comparator
        );
    }

    /**
     * Returns a mock substore that allows you to set up selectorStubs for
     * any 'fractal' stores your app creates with NgRedux.configureSubStore.
     *
     * If your app creates deeply nested sub stores from other sub store,
     * pass the chain of pathSelectors in as ordered arguments to mock
     * the nested sub store out.
     *
     * ```typescript
     *
     *   it('select name data from the substore', async(() => {
     *     const mockSubStore = MockNgRedux.getSubStore(['WALLABIES', 'items', 'id1']);
     *
     *     const selectorStub = mockSubStore.getSelectorStub('name');
     *     selectorStub.next('Wilbert');
     *     selectorStub.complete();
     *
     *     animalComponent.name$
     *       .subscribe(
     *         name => expect(name).toEqual('Wilbert'));
     *   }));
     * ```
     */

    static getSubStore<S>(
        ...pathSelectors: PathSelector[]
    ): NgRedux<S> {
        return pathSelectors.length
            ? MockNgRedux.store.getSubStore(...pathSelectors)
            : MockNgRedux.store;
    }

    /**
     * Reset all previously configured stubs.
     *
     * ```typescript
     * MockNgRedux.reset();
     * ```
     */

    static reset(): void {
        MockNgRedux.store.reset();
    }

    /**
     * Returns a subject that's connected to any observable returned by the
     * given selector. You can use this subject to pump values into your
     * components or services under test; when they call .select or @select
     * in the context of a unit test, MockNgRedux will give them the values
     * you pushed onto your stub.
     *
     * ```typescript
     *   it('select ticket price data from the substore', async(() => {
     *     const mockSubStore = MockNgRedux.getSubStore(
     *       ['WALLABIES', 'items', 'id1']);
     *
     *     const selectorStub = mockSubStore.getSelectorStub('ticketPrice');
     *     selectorStub.next(2);
     *     selectorStub.complete();
     *
     *     animalComponent.ticketPrice$
     *       .subscribe(
     *         ticketPrice => expect(ticketPrice).toEqual(2));
     *   }));
     * ```
     */

    getSelectorStub<SelectedState>(selector?: Selector<State, SelectedState>, comparator?: Comparator): Subject<SelectedState> {
        return this.initSelectorStub<SelectedState>(selector, comparator).subject;
    }

    /**
     * Returns a mock substore that allows you to set up selectorStubs for
     * any 'fractal' stores your app creates with NgRedux.configureSubStore.
     *
     * If your app creates deeply nested sub stores from other sub store,
     * pass the chain of pathSelectors in as ordered arguments to mock
     * the nested sub store out.
     *
     * ```typescript
     *
     *   it('select name data from the substore', async(() => {
     *     const mockSubStore = MockNgRedux.getSubStore(['WALLABIES', 'items', 'id1']);
     *
     *     const selectorStub = mockSubStore.getSelectorStub('name');
     *     selectorStub.next('Wilbert');
     *     selectorStub.complete();
     *
     *     animalComponent.name$
     *       .subscribe(
     *         name => expect(name).toEqual('Wilbert'));
     *   }));
     * ```
     */

    getSubStore<SubState>(...pathSelectors: PathSelector[]): MockNgRedux<any> {
        const [ first, ...rest ] = pathSelectors;

        return (first ? this.initSubStore(first).getSubStore(...rest) : this) as MockNgRedux<SubState>;
    }


    /**
     * Reset all previously configured stubs.
     *
     * ```typescript
     * MockNgRedux.reset();
     * ```
     */

    reset(): void {
        Object.keys(this.subStores).forEach(k => this.subStores[k].reset());
        this.selections = {};
        this.subStores = {};
    }

    /**
     * @hidden
     * access to singleton service instance.
     */

    static override get store(): MockNgRedux<any> {
        MockNgRedux.instance ||= new MockNgRedux<any>();

        return <MockNgRedux>MockNgRedux.instance;
    }

    /**
     * `Configures a Mock Redux store`
     *
     * >Configures a Redux store and allows NgRedux to observe and dispatch to it.
     *`This should only be called once for the lifetime of your app, for
     * example in the constructor of your root component.`
     */

    override configureStore(): void {}

    /**
     * `Config mock sub-store`
     * Carves off a 'subStore' or 'fractal' store from this one.
     *
     * >The returned object is itself an observable store, however any
     * selections, dispatches, or invocations of localReducer will be
     * specific to that sub-store and will not know about the parent
     * ObservableStore from which it was created.
     */

    override configureSubStore<SubState>(basePath: PathSelector, _: Reducer<SubState, AnyAction>): StoreInterface<SubState> {
        return this.initSubStore<SubState>(basePath);
    }

    /**
     * `Mock provideStore`
     *
     * > Accepts a Redux store, then sets it in NgRedux and allows NgRedux to observe and dispatch to it.
     * This should only be called once for the lifetime of your app, for example in the constructor of your root component.
     * If configureStore has been used this cannot be used.
     */

    override provideStore(_: Store<any>): void {

    }

    /**
     * `Mock dispatch`
     *
     * > A `dispatching function` (or simply *dispatch function*) is a function that
     * accepts an actions or an async actions; it then may or may not dispatch one
     * or more actions to the store.
     */

    override dispatch<A extends AnyAction>(action: A): A {
        return action;
    }

    /**
     * `Mock replaceReducer`
     *
     * > Replaces the reducer currently used by the store to calculate the state.
     * You might need this if your app implements code splitting, and you want to load some reducers dynamically.
     * You might also need this if you implement a hot reloading mechanism for Redux.
     */

    override replaceReducer(): null {
        return null;
    }

    /**
     * `Mock getState`
     * > Get store state
     */

    override getState(): State {
        return <State>{};
    }

    /**
     * `Mock subscribe`
     *
     * > Adds a change listener.
     * It will be called any time an actions is dispatched, and some part of the state tree may potentially have changed.
     * You may then call getState() to read the current state tree inside the callback.
     */

    override subscribe(): Unsubscribe {
        return () => null;
    }

    /**
     * `Mock Select`
     * > Select a slice of state to expose as an observable.
     */

    override select<SelectedState>(selector?: Selector<any, SelectedState>, comparator?: Comparator): Observable<any> {
        const stub = this.initSelectorStub<SelectedState>(selector, comparator);

        return stub.comparator
            ? stub.subject.pipe(distinctUntilChanged(stub.comparator))
            : stub.subject;
    }

    /**
     * @hidden
     * Init new mock sub-store
     */

    protected initSubStore<SubState>(basePath: PathSelector) {
        const result = this.subStores[JSON.stringify(basePath)] || new MockNgRedux<SubState>();
        this.subStores[JSON.stringify(basePath)] = result;

        return result;
    }

    /**
     * @hidden
     * Init selector stub
     */

    protected initSelectorStub<SelectedState>(
        selector?: Selector<State, SelectedState>,
        comparator?: Comparator
    ): SelectorStubRecord {
        const key = selector ? selector.toString() : '';
        const record = this.selections[key] || {
            subject: new ReplaySubject<SelectedState>(),
            comparator,
        };

        this.selections[key] = record;

        return record;
    }
}
