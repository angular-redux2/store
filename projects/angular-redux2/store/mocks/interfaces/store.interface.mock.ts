/**
 * Imports third-party types
 */

import { Subject } from 'rxjs';

/**
 * angular-redux2 types
 */

import { Comparator } from '@angular-redux3/store';
import { MockNgRedux } from '../services/ng-redux.service.mock';

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
