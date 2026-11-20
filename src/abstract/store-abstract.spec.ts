/**
 * Imports
 */

import { of } from 'rxjs';
import { AbstractStore } from '@abstract/store.abstract';

/**
 * Tests
 */

class StubStore extends AbstractStore<{ count: number }> {
    getState = xJet.fn(() => ({ count: 1 }));
    dispatch = <any> xJet.fn();
    subscribe = xJet.fn(() => () => undefined);
    replaceReducer = xJet.fn();
    select = <any> xJet.fn(() => of({ count: 1 }));
    selectSignal = <any> xJet.fn();
}

describe('AbstractStore', () => {
    describe('Symbol.observable', () => {
        test('should return the selection of the whole state', () => {
            const store = new StubStore();
            const observable = (<any> store)[Symbol.observable]();

            expect(store.select).toHaveBeenCalledWith();
            expect(observable).toBe(store.select.mock.results[0].value);
        });
    });
});
