/**
 * Import a third-party library
 */

import { distinctUntilChanged, ReplaySubject } from 'rxjs';

/**
 * Import third-party types
 */

import { Observable, Subject } from 'rxjs';
import { AnyAction, Reducer, Store, Unsubscribe } from 'redux';

/**
 * angular-redux2
 */

import { NgRedux } from '@angular-redux3/store';

/**
 * angular-redux2 types
 */
import { Comparator, PathSelector, Selector } from '@angular-redux3/store';

/**
 * Mocks type
 */

import { SubStoreService } from '@angular-redux3/store';
import { SelectorStubMap, SelectorStubRecord, SubStoreStubMap } from '../interfaces/store.interface.mock';

/**
 * This is the public of `@angular-redux3/store`.
 * It wraps the global redux store and adds a few other add-on methods.
 * It's what you'll inject into your Angular application as a service.
 *
 * `Convenience mock to make it easier to control selector behaviour in unit tests.`
 */

export class MockNgRedux<S = any> extends NgRedux<S> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override _unsubscribe: Unsubscribe = () => {};
    /**
     * Mock substore
     */

    subStores: SubStoreStubMap = {};

    /**
     * Mock selectors
     */

    selections: SelectorStubMap = {};

    /**
     * Instance of NgRedux (singleton service).
     * @hidden
     */

    protected static override instance: MockNgRedux<any>;

    /**
     * access to singleton service instance.
     * @hidden
     */

    static override get store(): MockNgRedux<any> {
        this.instance ||= new MockNgRedux<any>();

        return this.instance;
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

    static getSelectorStub<R, S>(
        selector?: Selector<R, S>,
        comparator?: Comparator
    ): Subject<S> {
        return this.store.getSelectorStub<S>(
            selector,
            comparator
        );
    }

    /**
     * Returns a mock substore that allows you to set up selectorStubs for
     * any 'fractal' stores your app creates with NgRedux.configureSubStore.
     *
     * If your app creates deeply nested sub stores from another sub store,
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
    ): MockNgRedux<S> {
        return pathSelectors.length
            ? this.store.getSubStore(...pathSelectors)
            : this.store;
    }

    /**
     * Reset all previously configured stubs.
     *
     * ```typescript
     * MockNgRedux.reset();
     * ```
     */

    static reset(): void {
        this.store.reset();
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

    getSelectorStub<SelectedState>(selector?: Selector<S, SelectedState>, comparator?: Comparator): Subject<SelectedState> {
        return this.initSelectorStub<SelectedState>(selector, comparator).subject;
    }

    /**
     * Returns a mock substore that allows you to set up selectorStubs for
     * any 'fractal' stores your app creates with NgRedux.configureSubStore.
     *
     * If your app creates deeply nested sub stores from another sub store,
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

    getSubStore<SubState>(...pathSelectors: PathSelector[]): MockNgRedux<SubState> {
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
     * `Configures a Mock Redux store`
     *
     * >Configures a Redux store and allows NgRedux to observe and dispatch to it.
     *`This should only be called once for the lifetime of your app, for
     *  example, in the constructor of your root component.`
     */

    override configureStore(): void {
        return;
    }

    /**
     * `Config mock sub-store`
     * Carves off a 'subStore' or 'fractal' store from this one.
     *
     * >The returned object is itself an observable store, however, any
     * selections, dispatches, or invocations of localReducer will be
     * specific to that sub-store and will not know about the parent
     * ObservableStore from which it was created.
     */

    override configureSubStore<SubState>(basePath: PathSelector, _: Reducer<SubState>): SubStoreService<SubState> {
        return this.initSubStore<SubState>(basePath);
    }

    /**
     * `Mock provideStore`
     *
     * > Accepts a Redux store, then sets it in NgRedux and allows NgRedux to observe and dispatch to it.
     * This should only be called once for the lifetime of your app, for example, in the constructor of your root component.
     */

    override provideStore(_: any, __: Store<any>): void {
        return;
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

    override getState(): S {
        return <S>{};
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
     * `Mock replaceStore`
     *
     *       Replace the store instance for this service.
     *
     *       @returns {void}
     * @param _store
     *      */
    override replaceStore(_store: Store<S>) {
        return;
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
     * Init new mock sub-store
     * @hidden
     */

    protected initSubStore<SubState>(basePath: PathSelector): any {
        const result = this.subStores[JSON.stringify(basePath)] || new MockNgRedux<SubState>();
        this.subStores[JSON.stringify(basePath)] = result;

        return result;
    }

    /**
     * Init selector stub
     * @hidden
     */

    protected initSelectorStub<SelectedState>(
        selector?: Selector<S, SelectedState>,
        comparator?: Comparator
    ): SelectorStubRecord {
        let signature = selector ? selector.toString() : '';

        if ('function' === typeof selector) {
            signature = this.coverageFunctionSignature(signature);
            /**
             * Run original coverage function
             */

            if ((window as any)['__coverage__']) {
                try {
                    selector(<any>{});
                } catch (e) { /* empty */
                }
            }
        }

        const record = this.selections[signature] || {
            subject: new ReplaySubject<SelectedState>(),
            comparator,
        };

        this.selections[signature] = record;

        return record;
    }

    /**
     * Remove coverage metadata from function signature.
     * and create uniq signature for stub selection.
     *
     * @param signature - function signature
     * @protected
     */

    protected coverageFunctionSignature(
        signature: string,
    ): string {
        signature = signature.replace(/cov_.+?[,;]/g, '');
        signature = signature.replace(/return/g, '');
        signature = signature.replace(/[^A-Za-z0-9]/g, '');

        return signature;
    }
}
