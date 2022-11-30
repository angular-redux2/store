/**
 * Imports third-party libraries
 */

import { Subject } from 'rxjs';

/**
 * Import angular-redux2
 */

import { Comparator } from '@angular-redux2/store';

/**
 * Services
 */

import { MockNgRedux } from '../services/ng-redux.service.mock';

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
