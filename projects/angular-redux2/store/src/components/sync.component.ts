/**
 * Imports third-party libraries
 */

import { AnyAction, Middleware } from 'redux';

/**
 * Services
 */

import { NgRedux } from '../services/ng-redux.service';

/**
 * Interfaces
 */

import { ConfigSyncInterface, GET_INIT_STATE, RECEIVE_INIT_STATE } from '../interfaces/sync.interface';

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

    private readonly windowID = guid();

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
     * Constructor
     */

    constructor(settings?: ConfigSyncInterface) {
        if (settings) {
            this.settings = Object.assign(this.settings, settings);
        }

        try {
            this.channel = new BroadcastChannel(this.settings.channelName);
            this.allowed = this.isActionAllowed();
            this.channel.onmessage = this.handleOnMessage.bind(this);

            if (settings?.initState) {
                this.initializeState();
            }
        } catch (e) {
            throw new Error('Your browser doesn\'t support cross tab communication.');
        }
    }


    /**
     * Handle message event
     */

    handleOnMessage(event: MessageEvent): void {
        const stampedAction = event.data;

        if (!stampedAction) {
            return;
        }

        switch (stampedAction.type) {
            case RECEIVE_INIT_STATE:
                return;

            case GET_INIT_STATE:
                this.emitMessage({
                    type: RECEIVE_INIT_STATE,
                    payload: this.settings.prepareState(NgRedux.store.getState())
                });

                return;
        }

        if (this.allowed(stampedAction)) {
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

    emitMessage(stampedAction: any): void {
        stampedAction = this.generateUidForAction(stampedAction);

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
     * Initialize store state.
     */

    private initializeState() {
        const initializeEvent = (event: MessageEvent): void => {
            if (event.data.type === RECEIVE_INIT_STATE) {
                NgRedux.store.dispatch(
                    Object.assign(event.data, {
                        $isSync: true,
                    }),
                );

                this.channel.removeEventListener('message', initializeEvent, false);
            }
        };

        this.channel.addEventListener('message', initializeEvent);
    }

    /**
     * Add sender data into action before post it.
     */

    private generateUidForAction(action: any): AnyAction {
        const stampedAction = action;
        stampedAction.$wuid = this.windowID;

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
 * @example
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
        sync.emitMessage({ type: GET_INIT_STATE });
    }

    return (store) => (next) => (action) => {
        if (action && !action.$wuid)
            sync.emitMessage(action);

        next(
            Object.assign(action, {
                $isSync: typeof action.$isSync === 'undefined' ? false : action.$isSync
            })
        );
    };
}
