/**
 * Imports
 */

import { NgModule } from '@angular/core';
import { DevToolsExtension } from '../services/dev-tool.service';

/**
 * The Angular module that provides {@link DevToolsExtension}.
 *
 * @remarks
 * {@link NgRedux} and {@link DevToolsExtension} are both provided in the root injector, so the module is kept for
 * applications that bootstrap an `NgModule`. A standalone application uses {@link provideNgRedux} instead.
 *
 * @example
 * ```ts
 * @NgModule({ imports: [ NgReduxModule ] })
 * class AppModule {
 *     constructor(ngRedux: NgRedux<AppState>, devTools: DevToolsExtension) {}
 * }
 * ```
 *
 * @see NgRedux
 * @see provideNgRedux
 * @see DevToolsExtension
 *
 * @since 5.0.0
 */

@NgModule({
    providers: [ DevToolsExtension ]
})
export class NgReduxModule {
}
