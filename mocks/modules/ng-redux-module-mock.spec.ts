/**
 * Imports
 */

import '@angular/compiler';
import { Injector, NgZone, createNgModule } from '@angular/core';
import { NgRedux, DevToolsExtension } from '@angular-redux2/store';
import { MockNgRedux } from '@mocks/services/ng-redux.service.mock';
import { MockDevToolsExtension } from '@mocks/services/dev-tool.service.mock';
import { MockNgReduxModule, mockNgReduxFactory } from '@mocks/modules/ng-redux.module.mock';

/**
 * Tests
 */

// The specs compile the library in JIT mode, without constructor metadata, so declare it by hand.
(<any> DevToolsExtension).ctorParameters = () => [{ type: NgZone }, { type: NgRedux }];

const parent = Injector.create({ providers: [{ provide: NgZone, useValue: {} }] });

describe('mockNgReduxFactory', () => {
    test('should return the shared MockNgRedux on every call', () => {
        const store = mockNgReduxFactory();

        expect(store).toBeInstanceOf(MockNgRedux);
        expect(store).toBe(MockNgRedux.store);
        expect(mockNgReduxFactory()).toBe(store);
    });
});

describe('MockNgReduxModule', () => {
    test('should provide the shared MockNgRedux as NgRedux', () => {
        const injector = createNgModule(MockNgReduxModule, parent).injector;

        expect(injector.get(NgRedux)).toBe(MockNgRedux.store);
    });

    test('should provide MockDevToolsExtension as DevToolsExtension', () => {
        const injector = createNgModule(MockNgReduxModule, parent).injector;

        expect(injector.get(DevToolsExtension)).toBeInstanceOf(MockDevToolsExtension);
    });
});
