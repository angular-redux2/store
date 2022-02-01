/**
 * Imports third-party libraries
 */

import { NgZone } from '@angular/core';
import { Injectable, ApplicationRef } from '@angular/core';

/**
 * NgRedux
 */

import { NgRedux } from './ng-redux.service';

/**
 * Declare window const
 * A window containing a DOM document; the document property points to the DOM document loaded in that window.
 */

const environment: { [key: string]: any } = typeof window !== 'undefined' ? window : {};

/**
 * Developer Tools to power-up Redux development workflow or any other architecture which handles the state change.
 *
 * `It can be used as a browser extension (for Chrome, Edge and Firefox), as a standalone app or as a React component integrated in the client app.`
 */

@Injectable()
export class DevToolsExtension {
    /**
     * Constructor
     */

    constructor(private appRef: ApplicationRef, private ngRedux: NgRedux<any>) {
    }

    /**
     * Returns true if the extension is installed and enabled.
     */

    isEnabled(): boolean {
        return environment && environment['__REDUX_DEVTOOLS_EXTENSION__'];
    }

    /**
     * A wrapper for the browser Extension `Redux DevTools`.
     * Makes sure state changes triggered by the extension
     * trigger Angular change detector.
     *
     * ```typescript
     * constructor(ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension) {
     *  let enhancer: Array<any> = [];
     *
     *  if (devTools.enhancer() && isDevMode())
     *      enhancer = [ devTools.enhancer() ];
     *
     *  ngRedux.configureStore(<any> rootReducer, INITIAL_STATE, [], enhancer);
     * }
     * ```
     *
     * @argument options: dev tool options; [same format as described here](https://github.com/reduxjs/redux-devtools/tree/main/packages/redux-devtools-instrument#api)
     */

    enhancer(options?: Object): any {
        let subscription: Function;

        if (!this.isEnabled()) {
            return null;
        }

        // Make sure changes from dev tools update angular views.
        environment['__REDUX_DEVTOOLS_EXTENSION__'].listen(({ type }: any) => {
            if (type === 'START') {
                subscription = this.ngRedux.subscribe(() => {
                    if (!NgZone.isInAngularZone()) {
                        this.appRef.tick();
                    }
                });
            } else if (type === 'STOP') {
                subscription();
            }
        });

        return environment['__REDUX_DEVTOOLS_EXTENSION__'](options);
    }
}
