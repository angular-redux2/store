/**
 * Imports third-party types
 */

import type { Subject } from 'rxjs';

/**
 * Angular-redux types
 */

import type { MockNgRedux } from '../services/ng-redux.service.mock';
import type { Comparator } from '../../src/interfaces/store.interface';

/**
 * Represents a selector stub record.
 * @interface
 * @property {Subject} subject - The subject of the stub record.
 * @property {Comparator} comparator - The comparator function to use for the stub record.
 */

export interface SelectorStubRecord {
    subject: Subject<any>;
    comparator: Comparator;
}

/**
 * A mapping of selectors to their respective stub records.
 * @interface
 */

export interface SelectorStubMap {
    /**
     * The selector key of the stub record.
     * @type {string}
     * @name SelectorStubMap#[selector
     */

    [selector: string]: SelectorStubRecord;
}

/**
 * A map of sub store stubs where the keys are strings representing the base path and values are MockNgRedux objects.
 *
 * @interface
 * @name SubStoreStubMap
 *
 * @property {string} basePath - The base path of the sub store stub.
 * @property {MockNgRedux} any - The sub store stub instance.
 */

export interface SubStoreStubMap {
    [basePath: string]: MockNgRedux<any>;
}