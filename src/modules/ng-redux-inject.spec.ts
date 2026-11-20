/**
 * Imports
 */

import { NgRedux } from '@services/ng-redux.service';
import { injectSelect } from '@modules/ng-redux.inject';
import { signal, Injector, runInInjectionContext } from '@angular/core';

/**
 * Tests
 */

describe('injectSelect', () => {
    test('should hand the selector and comparator to selectSignal of the injected store', () => {
        const selection = signal(3);
        const ngRedux = { selectSignal: xJet.fn(() => selection) };
        const injector = Injector.create({ providers: [{ provide: NgRedux, useValue: ngRedux }] });
        const comparator = (previous: number, next: number): boolean => previous === next;

        const count = runInInjectionContext(injector, () => injectSelect<number>('count', comparator));

        expect(ngRedux.selectSignal).toHaveBeenCalledWith('count', comparator);
        expect(count).toBe(selection);
    });

    test('should throw outside an injection context', () => {
        expect(() => injectSelect('count')).toThrow();
    });
});
