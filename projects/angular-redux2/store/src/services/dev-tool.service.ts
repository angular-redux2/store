/**
 * Import third-party libraries
 */

import { NgZone } from '@angular/core';
import { Injectable } from '@angular/core';
import { ApplicationRef } from '@angular/core';

/**
 * Import third-party types
 */

import { Unsubscribe } from 'redux';

/**
 * angular-redux2
 */

import { NgRedux } from './ng-redux.service';

/**
 * Declare window const
 * A window containing a DOM document; the document property points to the DOM document loaded in that window.
 */

const environment: any = typeof window !== 'undefined' ? window : {};

/**
 * Developer Tools to power-up Redux development workflow or any other architecture which handles the state change.
 * `It can be used as a browser extension (for Chrome, Edge and Firefox), as a standalone app or as a React component integrated in the client app.`
 */

@Injectable()
export class DevToolsExtension {

    /**
     * Constructs a new DevToolsExtension object with the given parameters.
     *
     * @constructor
     * @param {ApplicationRef} appRef - The application reference object.
     * @param {NgRedux<any>} ngRedux - The Angular Redux service instance.
     */

    constructor(private appRef: ApplicationRef, private ngRedux: NgRedux<any>) {}

    /**
     * Returns true if the extension is installed and enabled.
     */

    isEnabled(): boolean {
        return Boolean(environment && environment.__REDUX_DEVTOOLS_EXTENSION__);
    }

    /**
     * A wrapper for the browser Extension `Redux DevTools`.
     * Makes sure state changes triggered by the extension
     * trigger Angular change detector.
     *
     * @example
     * ```typescript
     * constructor(ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension) {
     *  let enhancer: Array<any> = [];
     *
     *  if (devTools.enhancer() && isDevMode())
     *      enhancer = [ devTools.enhancer() ];
     *
     *  ngRedux.configureStore(rootReducer, INITIAL_STATE, [], enhancer);
     * }
     *
     * // or
     *
     * constructor(ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension) {
     *     let enhancer: Array<any> = [];
     *
     *     if (devTools.enhancer() && isDevMode())
     *         enhancer = [ devTools.enhancer() ];
     *
     *     ngRedux.configureStore(rootReducer, INITIAL_STATE, [
     *         reduxSyncMiddleware({
     *             initState: true
     *         })
     *     ], enhancer);
     * }
     * ```
     *
     * @argument options: dev tool options; [same format as described here](https://github.com/reduxjs/redux-devtools/tree/main/packages/redux-devtools-instrument#api)
     */

    enhancer(options?: any): any {
        if (!this.isEnabled()) {
            return null;
        }

        let subscription: Unsubscribe;

        // Make sure changes from dev tools update angular views.
        environment['__REDUX_DEVTOOLS_EXTENSION__'].listen(({ type }: any) => {
            if (type === 'START') {
                subscription = this.ngRedux.subscribe(() => {
                    if (!NgZone.isInAngularZone()) {
                        this.appRef.tick(); // Trigger change detection from redux_devtool change.
                    }
                });
            } else if (type === 'STOP') {
                subscription();
            }
        });

        return environment['__REDUX_DEVTOOLS_EXTENSION__'](options);
    }
}
