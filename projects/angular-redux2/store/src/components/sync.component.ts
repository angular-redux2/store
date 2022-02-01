/**
 * Imports third-party libraries
 */

import { AnyAction, Middleware } from 'redux';
import { BroadcastChannel } from 'broadcast-channel';

/**
 * NgRedux
 */

import { NgRedux } from '../services/ng-redux.service';

/**
 * Interfaces
 */

import { ConfigSyncInterface } from '../interfaces/sync.interface';

/**
 * Init events type
 */

const GET_INIT_STATE = '&_GET_INIT_STATE';
const RECEIVE_INIT_STATE = '&_RECEIVE_INIT_STATE';

/**
 * Generate groups of 4 random characters
 */

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

/**
 * Generate guid
 * 14d80fc1-df2e-e57b-0fd6-9a6cca163293
 */

function guid() {
    return `${ s4() }${ s4() }-${ s4() }-${ s4() }-${ s4() }-${ s4() }${ s4() }${ s4() }`;
}

/**
 * Sync multi tab redux
 */

export class SyncComponent {

    /**
     * Current tab id
     */

    private readonly tab_id = guid();

    /**
     * Channel it allows communication between different documents.
     */

    private readonly channel: BroadcastChannel;

    /**
     * Validate action is allow.
     */

    private readonly allowed: (action: AnyAction) => boolean;

    /**
     * Default settings
     */

    private readonly settings: any = {
        channelName: 'redux_state_sync',
        broadcastChannelOption: {},
        prepareState: (state: any) => state
    };

    /**
     * List of tabs
     */

    private tabs: any = {};

    /**
     * last action dispatch uuid.
     */

    private lastUuid: string = '';

    /**
     * Constructor
     */

    constructor(settings?: ConfigSyncInterface) {
        this.channel = new BroadcastChannel(this.settings.channelName, {});
        this.channel.onmessage = this.handleOnMessage.bind(this);

        if (settings) {
            this.settings = Object.assign(this.settings, settings);
        }

        this.allowed = this.isActionAllowed();
    }

    /**
     * Handle message event
     */

    handleOnMessage(stampedAction: any): void {
        // ignore other values that saved to localstorage.
        if (!stampedAction.$uuid || stampedAction.$uuid === this.lastUuid) {
            return;
        }

        if (stampedAction.type === GET_INIT_STATE && !this.tabs[stampedAction.$wuid]) {
            this.tabs[stampedAction.$wuid] = true;
            this.handlePostMessage({
                type: RECEIVE_INIT_STATE,
                payload: this.settings.prepareState(NgRedux.store.getState())
            });

            return;
        }

        if (this.allowed(stampedAction) || stampedAction.type === RECEIVE_INIT_STATE) {
            this.lastUuid = stampedAction.$uuid;

            NgRedux.store.dispatch(
                Object.assign(stampedAction, {
                    $isSync: true,
                }),
            );
        }
    }

    /**
     * Handle post message event
     */

    handlePostMessage(stampedAction: any): void {
        stampedAction = this.generateUuidForAction(stampedAction);
        this.lastUuid = stampedAction.$uuid;

        try {
            if (
                this.allowed(stampedAction) ||
                stampedAction.type === GET_INIT_STATE ||
                stampedAction.type === RECEIVE_INIT_STATE
            ) {
                this.channel.postMessage(stampedAction);
            }
        } catch (e) {
            throw new Error('Your browser doesn\'t support cross tab communication.');
        }
    }

    /**
     * Add sender data into action before post it.
     */

    private generateUuidForAction(action: any): AnyAction {
        const stampedAction = action;
        stampedAction.$uuid = guid();
        stampedAction.$wuid = this.tab_id;

        return stampedAction;
    }

    /**
     * If is allowed action
     */

    private isActionAllowed(): (action: AnyAction) => boolean {
        const settings = this.settings;
        let allowed = (action: AnyAction) => true;

        if (settings.predicate && typeof settings.predicate === 'function') {
            allowed = settings.predicate;
        } else if (Array.isArray(settings.blacklist)) {
            allowed = (action) => settings.blacklist.indexOf(action.type) < 0;
        } else if (Array.isArray(settings.whitelist)) {
            allowed = (action) => settings.whitelist.indexOf(action.type) >= 0;
        }

        return allowed;
    }
}

/**
 * Sync redux state across browser tabs
 * A lightweight middleware to sync your redux state across browser tabs.
 * It will listen to the Broadcast Channel and dispatch the same actions dispatched in other tabs to keep the redux state in sync.
 *
 * ```typescript
 * constructor(ngRedux: NgRedux<IAppState>, devTools: DevToolsExtension) {
 *     let enhancer: Array<any> = [];
 *
 *     if (devTools.enhancer() && isDevMode())
 *         enhancer = [ devTools.enhancer() ];
 *
 *     ngRedux.configureStore(<any> rootReducer, INITIAL_STATE, [
 *         reduxSyncMiddleware({ initState: true })
 *     ], enhancer);
 * }
 * ```
 *
 * `Before you use`
 * >Please take note that BroadcastChannel can only send data that is supported by the structured clone algorithm (`Strings`, `Objects`, `Arrays`, `Blobs`, `ArrayBuffer`, `Map`),
 * so you need to make sure that the actions that you want to send to other tabs don't include any functions in the payload.`
 */

export function reduxSyncMiddleware(settings?: ConfigSyncInterface): Middleware {
    const sync = new SyncComponent(settings);

    if (settings?.initState) {
        sync.handlePostMessage({ type: GET_INIT_STATE });
    }

    return (store) => (next) => (action) => {
        if (action && !action.$uuid)
            sync.handlePostMessage(action);

        next(
            Object.assign(action, {
                $isSync: typeof action.$isSync === undefined ? false : action.$isSync
            })
        );
    };
}
