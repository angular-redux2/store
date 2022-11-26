/**
 * Import services
 */

import { DevToolsExtension } from './dev-tool.service';

/**
 * Before each test initial new instance.
 */

let devTool: DevToolsExtension;
const appRef = <any> jest.fn();
const ngRedux = <any> jest.fn();
const environment: { [key: string]: any } = typeof window !== 'undefined' ? window : {};

beforeEach(() => {
    devTool = new DevToolsExtension(appRef, ngRedux);
    environment['__REDUX_DEVTOOLS_EXTENSION__'] = undefined;
});

test('Should environment __REDUX_DEVTOOLS_EXTENSION__ to be falsy.', () => {
    expect(devTool.isEnabled()).toBe(false);
});

test('Should environment __REDUX_DEVTOOLS_EXTENSION__ to be truthy.', () => {
    environment['__REDUX_DEVTOOLS_EXTENSION__'] = {}

    expect(devTool.isEnabled()).toBe(true);
});

test('Should enhancer to return null when devtool is undefined.', () => {
    expect(devTool.enhancer({})).toBe(null);
});

test('Should enhancer to call devtool listen for detect changes.', () => {
    const listen = jest.fn();
    environment['__REDUX_DEVTOOLS_EXTENSION__'] = jest.fn();
    environment['__REDUX_DEVTOOLS_EXTENSION__'].listen = listen;

    devTool.enhancer({});
    expect(listen).toBeCalled();
});

test('Should enhancer to call devtool callback with start and stop.', () => {
    const unsubscribe = jest.fn();
    let _listenCallback: Function = () => {};
    let _subscribeCallback: Function = () => {};

    const listen = jest.fn((callback: Function) => {
        _listenCallback = callback;
    });

    const subscribe = jest.fn((callback: Function) => {
        _subscribeCallback = callback;

        return unsubscribe;
    });

    appRef.tick = jest.fn();
    ngRedux.subscribe = subscribe;
    environment['__REDUX_DEVTOOLS_EXTENSION__'] = jest.fn();
    environment['__REDUX_DEVTOOLS_EXTENSION__'].listen = listen;
    devTool.enhancer({});

    _listenCallback({ type: 'START' });
    _subscribeCallback();
    _listenCallback({ type: 'STOP' });

    expect(appRef.tick).toBeCalledTimes(1);
    expect(unsubscribe).toBeCalledTimes(1);
});
