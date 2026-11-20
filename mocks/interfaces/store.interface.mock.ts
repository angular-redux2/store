/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Subject } from 'rxjs';
import type { ComparatorType } from '@angular-redux2/store';
import type { MockNgRedux } from '../services/ng-redux.service.mock';

/**
 * The stub that {@link MockNgRedux} keeps for one selector.
 *
 * @remarks
 * Every `select` call with the same selector shares the record,
 * so the values pushed into `subject` reach every observable selected that way.
 *
 * @example
 * ```ts
 * const record: SelectorStubRecordInterface = { subject: new ReplaySubject(), comparator: undefined };
 * ```
 *
 * @see SelectorStubMapInterface
 *
 * @since 5.0.0
 */

export interface SelectorStubRecordInterface {
    /**
     * The subject that feeds every observable selected with this selector.
     *
     * @remarks
     * It is a `ReplaySubject` without a buffer limit, so a late subscriber receives every value pushed so far.
     *
     * @example
     * ```ts
     * record.subject.next('Ada'); // every name$ observable emits 'Ada'
     * ```
     *
     * @since 5.0.0
     */

    subject: Subject<unknown>;

    /**
     * The comparator of the first `select` call that created the record.
     *
     * @remarks
     * When set, the mock pipes the subject through `distinctUntilChanged` with it.
     *
     * @example
     * ```ts
     * record.comparator; // undefined unless the first select passed one
     * ```
     *
     * @since 5.0.0
     */

    comparator: ComparatorType;
}

/**
 * The selector stubs of one {@link MockNgRedux}, keyed by the string form of each selector.
 *
 * @remarks
 * A property selector keys by itself and a path selector by its comma-joined form,
 * so `'a,b'` and `[ 'a', 'b' ]` share a stub.
 * A function selector keys by its source text,
 * without coverage counters, the word `return`, or any non-alphanumeric character.
 * A missing selector keys by the empty string.
 *
 * @example
 * ```ts
 * MockNgRedux.store.getSelectorStub([ 'user', 'name' ]);
 * MockNgRedux.store.selections['user,name']; // the record behind that stub
 * ```
 *
 * @see SelectorStubRecordInterface
 *
 * @since 5.0.0
 */

export interface SelectorStubMapInterface {
    /**
     * The stub record for the selector with this key.
     *
     * @example
     * ```ts
     * stubs['count'].subject.next(3);
     * ```
     *
     * @since 5.0.0
     */

    [selector: string]: SelectorStubRecordInterface;
}

/**
 * The mock substores of one {@link MockNgRedux}, keyed by the JSON form of each base path.
 *
 * @remarks
 * Each mock substore is itself a {@link MockNgRedux} with its own selector stubs,
 * so nested paths form a tree of mocks.
 *
 * @example
 * ```ts
 * MockNgRedux.getSubStore([ 'users', 'u1' ]);
 * MockNgRedux.store.subStores['["users","u1"]']; // that mock substore
 * ```
 *
 * @see MockNgRedux.getSubStore
 *
 * @since 5.0.0
 */

export interface SubStoreStubMapInterface {
    /**
     * The mock substore for the base path with this key.
     *
     * @example
     * ```ts
     * stubs['["users","u1"]'].getSelectorStub('name').next('Ada');
     * ```
     *
     * @since 5.0.0
     */

    [basePath: string]: MockNgRedux<unknown>;
}
