/**
 * Imports
 */

import { MockDevToolsExtension } from '@mocks/services/dev-tool.service.mock';

describe('MockDevToolsExtension', () => {
    let appRef: any;
    let ngRedux: any;
    let mockDevToolsExtension: MockDevToolsExtension;

    beforeEach(() => {
        appRef = {
            tick: xJet.fn()
        };

        ngRedux = {
            subscribe: xJet.fn()
        };

        mockDevToolsExtension = new MockDevToolsExtension(appRef, ngRedux);
    });

    test('should create an instance', () => {
        expect(mockDevToolsExtension).toBeTruthy();
    });
});
