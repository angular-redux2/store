/**
 * Imports
 */

import '@angular/compiler';
import { NgRedux } from '@services/ng-redux.service';
import { NgReduxModule } from '@modules/ng-redux.module';
import { DevToolsExtension } from '@services/dev-tool.service';
import { Injector, NgModule, NgZone, createNgModule } from '@angular/core';

/**
 * Tests
 */

// The specs compile the library in JIT mode, without constructor metadata, so declare it by hand.
(<any> DevToolsExtension).ctorParameters = () => [{ type: NgZone }, { type: NgRedux }];

const parent = Injector.create({
    providers: [
        { provide: NgZone, useValue: {} },
        { provide: NgRedux, useValue: {} }
    ]
});

@NgModule({})
class EmptyModule {
}

describe('NgReduxModule', () => {
    test('should provide DevToolsExtension to an injector outside the root scope', () => {
        const injector = createNgModule(NgReduxModule, parent).injector;

        expect(injector.get(DevToolsExtension)).toBeInstanceOf(DevToolsExtension);
    });

    test('should be what makes DevToolsExtension available there', () => {
        const injector = createNgModule(EmptyModule, parent).injector;

        expect(() => injector.get(DevToolsExtension)).toThrow('NG0201');
    });
});
