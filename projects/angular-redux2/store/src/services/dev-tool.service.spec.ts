/**
 * angular-redux2
 */

import { DevToolsExtension } from './dev-tool.service';

describe('DevToolsExtension', () => {
    let devTool: DevToolsExtension;
    let appRef: any;
    let ngRedux: any;
    let environment: any;

    beforeAll(() => {
        appRef = {
            tick: jest.fn(),
        };

        ngRedux = {
            subscribe: jest.fn(),
        };

        environment = typeof window !== 'undefined' ? window : {};
        environment.__REDUX_DEVTOOLS_EXTENSION__ = undefined;
    });

    beforeEach(() => {
        devTool = new DevToolsExtension(appRef, ngRedux);
        environment.__REDUX_DEVTOOLS_EXTENSION__ = undefined;
    });

    describe('isEnabled', () => {
        test('should return false when __REDUX_DEVTOOLS_EXTENSION__ is undefined', () => {
            expect(devTool.isEnabled()).toBe(false);
        });

        test('should return true when __REDUX_DEVTOOLS_EXTENSION__ is defined', () => {
            environment.__REDUX_DEVTOOLS_EXTENSION__ = {};
            expect(devTool.isEnabled()).toBe(true);
        });
    });

    describe('enhancer', () => {
        test('should return null when __REDUX_DEVTOOLS_EXTENSION__ is undefined', () => {
            expect(devTool.enhancer({})).toBe(null);
        });

        test('should call listen method when __REDUX_DEVTOOLS_EXTENSION__ is defined', () => {
            const listen = jest.fn();
            environment.__REDUX_DEVTOOLS_EXTENSION__ = jest.fn();
            environment.__REDUX_DEVTOOLS_EXTENSION__.listen = listen;

            devTool.enhancer({});
            expect(listen).toBeCalled();
        });

        test('should call tick and unsubscribe when START and STOP actions are detected', () => {
            const unsubscribe = jest.fn();
            const subscribe = jest.fn((callback) => {
                callback();

                return unsubscribe;
            });
            const listen = jest.fn().mockImplementation((callback) => {
                callback({ type: 'START' });
                callback({ type: 'STOP' });
            });

            jest.spyOn(devTool, 'isEnabled').mockReturnValue(true);
            ngRedux.subscribe = subscribe;
            environment.__REDUX_DEVTOOLS_EXTENSION__ = jest.fn();
            environment.__REDUX_DEVTOOLS_EXTENSION__.listen = listen;
            devTool.enhancer({});

            expect(appRef.tick).toBeCalledTimes(1);
            expect(unsubscribe).toBeCalledTimes(1);
        });
    });
});
