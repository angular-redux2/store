/**
 * Imports
 */

import * as api from './mocks';

/**
 * Tests
 */

describe('@angular-redux2/store/mocks', () => {
    test('should export exactly the mock store and its provider', () => {
        expect(Object.keys(api).sort()).toEqual([ 'MockNgRedux', 'provideMockNgRedux' ]);
    });
});
