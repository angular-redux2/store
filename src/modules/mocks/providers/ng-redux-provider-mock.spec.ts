/**
 * Imports
 */

import { NgRedux } from '@angular-redux2/store';
import { Injector, runInInjectionContext } from '@angular/core';
import { MockNgRedux } from '@mocks/services/ng-redux.service.mock';
import { injectSelect } from '@ng-redux/components/inject.component';
import { provideMockNgRedux } from '@mocks/providers/ng-redux.provider.mock';

/**
 * Tests
 */

describe('provideMockNgRedux', () => {
    test('should hand out one mock as both NgRedux and MockNgRedux', () => {
        const injector = Injector.create({ providers: provideMockNgRedux({ counter: 0 }) });

        expect(injector.get(NgRedux)).toBeInstanceOf(MockNgRedux);
        expect(injector.get(MockNgRedux)).toBe(injector.get(NgRedux));
    });

    test('should let code that injects NgRedux read the state that the test sets', () => {
        const injector = Injector.create({ providers: provideMockNgRedux({ counter: 0 }) });
        const count = runInInjectionContext(injector, () => injectSelect((state: { counter: number }) => state.counter));

        injector.get(MockNgRedux<{ counter: number }>).patchState({ counter: 4 });

        expect(count()).toBe(4);
    });
});
