/**
 * Imports
 */

import * as api from './index';

/**
 * Tests
 */

describe('@angular-redux2/store', () => {
    test('should export exactly the public API and no internal helper', () => {
        expect(Object.keys(api).sort()).toEqual([
            'NgRedux',
            'STATE_KEY',
            'createAction',
            'createSlice',
            'draft',
            'freezeReducer',
            'injectSelect',
            'injectSubstore',
            'provideNgRedux',
            'provideNgReduxFeature'
        ]);
    });
});
