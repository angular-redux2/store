/**
 * Import third-party libraries
 */

import { NgModule } from '@angular/core';

/**
 * Angular-redux
 */

import { NgRedux, DevToolsExtension } from '../src/public-api';

/**
 * Mocks
 */

import { MockNgRedux } from './services/ng-redux.service.mock';
import { MockDevToolsExtension } from './services/dev-tool.service.mock';

/**
 * Mock factory
 * @hidden
 */
export function _mockNgReduxFactory() {
    return MockNgRedux.store;
}

/**
 * NgRedux module
 */

@NgModule({
    imports: [],
    providers: [
        { provide: NgRedux, useFactory: _mockNgReduxFactory  },
        { provide: DevToolsExtension, useClass: MockDevToolsExtension }
    ],
})
export class MockNgReduxModule {
}
