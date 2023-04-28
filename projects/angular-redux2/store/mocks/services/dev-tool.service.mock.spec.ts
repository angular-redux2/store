/**
 * Mocks type
 */

import { MockDevToolsExtension } from './dev-tool.service.mock';

describe('MockDevToolsExtension', () => {
    let appRef: any;
    let ngRedux: any;
    let mockDevToolsExtension: MockDevToolsExtension;

    beforeEach(() => {
        appRef = {
            tick: jest.fn(),
        };

        ngRedux = {
            subscribe: jest.fn(),
        };

        mockDevToolsExtension = new MockDevToolsExtension(appRef, ngRedux);
    });

    test('should create an instance', () => {
        expect(mockDevToolsExtension).toBeTruthy();
    });
});
