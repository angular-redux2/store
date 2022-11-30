/**
 * Imports third-party libraries
 */

import { AnyAction } from 'redux';

/**
 * Init events type
 */

export const GET_INIT_STATE = '&_GET_INIT_STATE';
export const RECEIVE_INIT_STATE = '&_RECEIVE_INIT_STATE';

/**
 * Sync settings
 *
 * > You should only use one of the option to filter your actions. if you have all 3 options `predicate`, `blacklist`, and `whitelist`,
 * only one will be effective and the priority is predicate > blacklist > whitelist.
 */

export interface ConfigSyncInterface {
    /**
     * name of communication channel.
     */

    channelName?: string;

    /**
     * copy init state from under tab (if exists).
     */

    initState?: boolean;

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
}

