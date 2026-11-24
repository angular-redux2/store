/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { StoreEnhancer } from 'redux';

/**
 * The global that the Redux DevTools browser extension installs.
 *
 * @remarks
 * The store reads it from `globalThis`, so it is simply absent during server-side rendering
 * and in browsers without the extension.
 *
 * @since 6.0.0
 */

export interface DevToolsGlobalInterface {
    /**
     * Creates the enhancer that connects a store to the extension.
     *
     * @since 6.0.0
     */

    __REDUX_DEVTOOLS_EXTENSION__?: (options?: Record<string, unknown>) => StoreEnhancer;
}
