/**
 * Imports third-party libraries
 */

import { AnyAction } from 'redux';

/**
 * Broadcast types - which type of communication to use.
 */

export type BroadcastTypes = 'native' | 'idb' | 'localstorage' | 'node';

/**
 * Sync settings
 * base on [https://github.com/aohua/redux-state-sync]
 *
 * > You should only use one of the option to filter your actions. if you have all 3 options `predicate`, `blacklist`, and `whitelist`,
 * only one will be effective and the priority is predicate > blacklist > whitelist.
 */

export interface ConfigSyncInterface {
    /**
     * copy init state from under tab (if exists).
     */

    initState?: boolean;

    /**
     * name of communication channel.
     */

    channelName?: string;

    /**
     * Array of action that will not be triggered in other tabs.
     */

    blacklist?: Array<string>;

    /**
     * only action will be triggered in other tabs.
     */

    whitelist?: Array<string>;

    /**
     * A function to let you filter the actions as you wanted.
     */

    predicate?: (action: AnyAction) => boolean;

    /**
     * Prepare the initial state for sending to other tabs.
     */

    prepareState?: (action: AnyAction) => any;

    broadcastChannelOption?: {

        /**
         * with type of communication to use (`native` | `idb` | `localstorage` | `node`).
         */

        type?: BroadcastTypes,

        /**
         * Use web worker ?
         */

        webWorkerSupport?: boolean
    };
}

