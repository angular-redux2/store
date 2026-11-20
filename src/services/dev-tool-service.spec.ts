/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { DevToolsExtension } from '@services/dev-tool.service';

/**
 * Imports
 */

import { NgZone } from '@angular/core';

describe('DevToolsExtension', () => {
    let devTool: DevToolsExtension;
    let DevTools: typeof DevToolsExtension;
    let ngZone: any;
    let ngRedux: any;
    let environment: any;

    beforeAll(async () => {
        // The service reads `window` once at module load, so it has to exist before the import.
        (globalThis as any).window ??= globalThis;
        DevTools = (await import('./dev-tool.service')).DevToolsExtension;

        ngZone = {
            run: xJet.fn()
        };

        ngRedux = {
            subscribe: xJet.fn()
        };

        environment = window;
        environment.__REDUX_DEVTOOLS_EXTENSION__ = undefined;
    });

    beforeEach(() => {
        devTool = new DevTools(ngZone, ngRedux);
        environment.__REDUX_DEVTOOLS_EXTENSION__ = undefined;
    });

    afterEach(() => {
        xJet.restoreAllMocks();
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
            const listen = xJet.fn();
            environment.__REDUX_DEVTOOLS_EXTENSION__ = xJet.fn();
            environment.__REDUX_DEVTOOLS_EXTENSION__.listen = listen;

            devTool.enhancer({});
            expect(listen).toHaveBeenCalled();
        });

        test('should re-enter the zone and unsubscribe when START and STOP actions are detected', () => {
            const unsubscribe = xJet.fn();
            const subscribe = xJet.fn((callback: any) => {
                callback();

                return unsubscribe;
            });
            const listen = xJet.fn().mockImplementation((callback: any) => {
                callback({ type: 'START' });
                callback({ type: 'STOP' });
            });

            xJet.spyOn(devTool, 'isEnabled').mockReturnValue(true);
            ngRedux.subscribe = subscribe;
            environment.__REDUX_DEVTOOLS_EXTENSION__ = xJet.fn();
            environment.__REDUX_DEVTOOLS_EXTENSION__.listen = listen;
            devTool.enhancer({});

            expect(ngZone.run).toHaveBeenCalledTimes(1);
            expect(unsubscribe).toHaveBeenCalledTimes(1);
        });

        test('should leave a change made inside Angular alone, so a render never starts another (NG0101)', () => {
            ngZone.run.mockClear();
            const listen = xJet.fn().mockImplementation((callback: any) => callback({ type: 'START' }));
            ngRedux.subscribe = xJet.fn((callback: any) => {
                callback();

                return xJet.fn();
            });

            xJet.spyOn(devTool, 'isEnabled').mockReturnValue(true);
            xJet.spyOn(NgZone, 'isInAngularZone').mockReturnValue(true);
            environment.__REDUX_DEVTOOLS_EXTENSION__ = xJet.fn();
            environment.__REDUX_DEVTOOLS_EXTENSION__.listen = listen;
            devTool.enhancer({});

            expect(ngZone.run).not.toHaveBeenCalled();
        });
    });
});
