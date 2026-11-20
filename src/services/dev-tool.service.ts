/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { StoreEnhancer, Unsubscribe } from 'redux';

/**
 * Imports
 */

import { NgRedux } from './ng-redux.service';
import { Injectable, NgZone } from '@angular/core';

/**
 * The Redux DevTools extension as the browser exposes it on `window`.
 *
 * @since 6.0.0
 */

interface DevToolsGlobalInterface {
    /**
     * Creates the store enhancer that connects a store to the extension.
     *
     * @param options - The extension options
     * @returns The store enhancer
     *
     * @since 6.0.0
     */

    (options?: unknown): StoreEnhancer;

    /**
     * Registers a listener for the messages the extension sends, such as `START` and `STOP`.
     *
     * @param listener - Called with each message
     *
     * @since 6.0.0
     */

    listen(listener: (message: { type: string }) => void): void;
}

/**
 * The global `window`, or an empty object outside a browser.
 *
 * @remarks
 * The fallback keeps {@link DevToolsExtension.isEnabled} safe under server-side rendering and in Node tests,
 * where it reports the extension as missing.
 *
 * @since 5.0.0
 */

const environment = <Record<string, unknown>> (typeof window !== 'undefined' ? window : {});

/**
 * Connects the Redux DevTools browser extension to the store and to Angular change detection.
 *
 * @remarks
 * Pass the result of {@link DevToolsExtension.enhancer} to {@link NgRedux.configureStore} with the other enhancers.
 * When the extension starts monitoring, the service subscribes to the store,
 * and re-enters the Angular zone for state changes that happen outside it, such as a time-travel jump from the
 * extension. The service is provided in the root injector; {@link provideNgRedux} wires it up from its `devTools`
 * option.
 *
 * @example
 * ```ts
 * class AppModule {
 *     constructor(ngRedux: NgRedux<AppState>, devTools: DevToolsExtension) {
 *         const enhancer = isDevMode() ? devTools.enhancer() : null;
 *
 *         ngRedux.configureStore(rootReducer, INITIAL_STATE, [], enhancer ? [ enhancer ] : []);
 *     }
 * }
 * ```
 *
 * @see NgRedux.configureStore
 *
 * @since 5.0.0
 */

@Injectable({ providedIn: 'root' })
export class DevToolsExtension {

    /**
     * Creates the service with the zone and the store that it keeps in sync.
     *
     * @param ngZone - The zone that a state change from the extension re-enters, so a zone-based app renders it
     * @param ngRedux - The store that the extension monitors
     *
     * @remarks
     * Angular injects both dependencies, so the service is normally obtained through injection rather than `new`.
     *
     * @example
     * ```ts
     * const devTools = TestBed.inject(DevToolsExtension);
     * ```
     *
     * @since 5.0.0
     */

    constructor(private ngZone: NgZone, private ngRedux: NgRedux<unknown>) {}

    /**
     * Whether the Redux DevTools extension is installed in this browser.
     *
     * @returns `true` when the extension has registered its global hook
     *
     * @remarks
     * It checks for `__REDUX_DEVTOOLS_EXTENSION__` on the global `window`,
     * so it returns `false` outside a browser.
     *
     * @example
     * ```ts
     * devTools.isEnabled(); // true with the extension installed
     * ```
     *
     * @since 5.0.0
     */

    isEnabled(): boolean {
        return Boolean(environment && environment['__REDUX_DEVTOOLS_EXTENSION__']);
    }

    /**
     * Returns the store enhancer of the extension, wired into Angular change detection.
     *
     * @param options - The options of the extension, as described in the redux-devtools-instrument API
     * @returns The store enhancer, or `null` when the extension is not installed
     *
     * @remarks
     * Each call registers a new listener with the extension and creates a new enhancer, so call it once per store.
     * On `START`, the listener subscribes to the store and re-enters the Angular zone for every state change that
     * happens outside it, such as a jump or a dispatch from the extension, so a zone-based app renders the change.
     * It never forces change detection itself: a zoneless app already renders through the `async` pipe and
     * signals, and a dispatch made while Angular renders must not start a second render (NG0101).
     * On `STOP`, it removes that subscription.
     * The `options` format is described in the
     * [redux-devtools-instrument API](https://github.com/reduxjs/redux-devtools/tree/main/packages/redux-devtools-instrument#api).
     *
     * @example
     * ```ts
     * const enhancer = devTools.enhancer({ maxAge: 50 }); // null without the extension
     *
     * ngRedux.configureStore(rootReducer, INITIAL_STATE, [], enhancer ? [ enhancer ] : []);
     * ```
     *
     * @since 5.0.0
     */

    enhancer(options?: unknown): StoreEnhancer | null {
        if (!this.isEnabled()) {
            return null;
        }

        let subscription: Unsubscribe;

        // Make sure changes from dev tools update angular views.
        const extension = <DevToolsGlobalInterface> environment['__REDUX_DEVTOOLS_EXTENSION__'];
        extension.listen(({ type }) => {
            if (type === 'START') {
                subscription = this.ngRedux.subscribe(() => {
                    if (!NgZone.isInAngularZone()) {
                        this.ngZone.run(() => undefined);
                    }
                });
            } else if (type === 'STOP') {
                subscription();
            }
        });

        return extension(options);
    }
}
