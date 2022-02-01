/**
 * Imports third-party libraries
 */

import { NgModule } from '@angular/core';

/**
 * Import services
 */

import { DevToolsExtension } from './services/dev-tool.service';

/**
 * NgReduxModule
 */

@NgModule({
    providers: [
        DevToolsExtension
    ],
})
export class NgReduxModule {
}
