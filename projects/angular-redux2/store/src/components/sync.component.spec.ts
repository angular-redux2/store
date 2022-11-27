/**
 * Services
 */

import { NgRedux } from '../services/ng-redux.service';

/**
 * Components
 */

import { SyncComponent, reduxSyncMiddleware } from './sync.component';

/**
 * Interfaces
 */

import { GET_INIT_STATE, RECEIVE_INIT_STATE } from '../interfaces/sync.interface';

/**
 * Initialize global test mocks
 */

jest.mock('../services/ng-redux.service');

describe('Should test broadcast channel api.', () => {
    /**
     * Initialize local test mocks
     */

    let sync: SyncComponent;
    let ngRedux: NgRedux<any>;
    const mockBroadcastChannelStruct = {
        onmessage: (message: any) => {},
        postMessage: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    };

    global.BroadcastChannel = <any>jest.fn(() => {
        return mockBroadcastChannelStruct;
    });

    beforeEach(() => {
        ngRedux = new NgRedux();
        (NgRedux as any).store = ngRedux;
        sync = new SyncComponent({
            channelName: 'specTest'
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Should BroadcastChannel to be call.', () => {
        expect(global.BroadcastChannel).toBeCalledWith('specTest');
    });

    test('Should handleOnMessage rerun if wuid not set.', () => {
        const spyEmitMessage = jest.spyOn(sync, 'emitMessage');

        mockBroadcastChannelStruct.onmessage('Hi');

        expect(ngRedux.dispatch).not.toBeCalled();
        expect(spyEmitMessage).not.toBeCalled();
    });

    test('Should send store state to under tab.', () => {
        mockBroadcastChannelStruct.onmessage({
            data: {
                $wuid: 1234,
                type: GET_INIT_STATE
            }
        });

        expect(ngRedux.getState).toBeCalled();
        expect(mockBroadcastChannelStruct.postMessage).toBeCalled();
    });

    test('Should initialize store ones on startup.', () => {
        mockBroadcastChannelStruct.addEventListener.mockImplementation((name: string, callback: any) => {
            callback({
                data: {
                    $wuid: 1234,
                    type: RECEIVE_INIT_STATE
                }
            })
        });

        sync = new SyncComponent({
            channelName: 'specTest',
            initState: true
        });

        expect(ngRedux.dispatch).toBeCalled();
        expect(mockBroadcastChannelStruct.removeEventListener).toBeCalled();
    });

    test('Should emit new action.', () => {
        sync.emitMessage({
            type: GET_INIT_STATE
        });

        expect(mockBroadcastChannelStruct.postMessage).toBeCalled();
    });

    test('Should test that action allow bt external function "predicate".', () => {
        const predicate = jest.fn((action: any) => {
            return action.type === 'test';
        });

        const sync = new SyncComponent({
            predicate
        });

        sync.emitMessage({
            type: 'test'
        });

        expect(predicate).toBeCalled();
    });

    test('Should test that action allow external blacklist.', () => {
        const sync = new SyncComponent({
            blacklist: ['test']
        });

        sync.emitMessage({
            type: 'test'
        });

        expect(mockBroadcastChannelStruct.postMessage).not.toBeCalled();
    });

    test('Should test that action allow bt external whitelist.', () => {
        const sync = new SyncComponent({
            whitelist: ['test']
        });

        sync.emitMessage({
            type: 'test'
        });

        expect(mockBroadcastChannelStruct.postMessage).toBeCalled();
    });

    test('Should test reduxSyncMiddleware create Middleware.', () => {
        const next = jest.fn();
        const middleware = reduxSyncMiddleware({
            initState: true
        });

        expect(mockBroadcastChannelStruct.postMessage).toBeCalled();
        middleware(<any>{})(next)({});
        expect(next).toBeCalled();
    });
});

describe('Should test throw exception in sync component.', () => {
    test('Should throw exception that BroadcastChannel not support.', () => {
        (global.BroadcastChannel as any) = undefined;

        expect(() => {
            new SyncComponent();
        }).toThrow('Your browser doesn\'t support cross tab communication.');
    });

    test('Should throw exception that BroadcastChannel not support on emit.', () => {
        (global.BroadcastChannel as any) = jest.fn();
        const sync = new SyncComponent();
        (sync as any).channel = undefined;

        expect(() => {
            sync.emitMessage({
                type: GET_INIT_STATE
            })
        }).toThrow('Your browser doesn\'t support cross tab communication.');
    });

    afterAll(() => {
        jest.resetAllMocks();
    });
});
