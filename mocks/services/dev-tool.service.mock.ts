/**
 * Imports
 */

import { Injectable } from '@angular/core';
import { DevToolsExtension } from '@angular-redux2/store';

/**
 * The stand-in for {@link DevToolsExtension} in unit tests.
 *
 * @remarks
 * It inherits the real behavior unchanged.
 * Outside a browser with the extension, `isEnabled` returns `false` and `enhancer` returns `null`,
 * so a component that sets up DevTools runs in a test without it.
 * {@link MockNgReduxModule} provides it in place of the real service.
 *
 * @example
 * ```ts
 * const devTools = TestBed.inject(DevToolsExtension); // a MockDevToolsExtension
 * devTools.enhancer();                                 // null in a test
 * ```
 *
 * @see MockNgReduxModule
 *
 * @since 5.0.0
 */

@Injectable()
export class MockDevToolsExtension extends DevToolsExtension {}
