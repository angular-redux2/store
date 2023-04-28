/**
 * angular-redux2
 */

import { Substore } from './substore.decorator';
import { LOCAL_REDUCER_KEY } from '../interfaces/fractal.interface';

describe('Substore', () => {
    test('should set the reducer to the LOCAL_REDUCER_KEY property of the class constructor', () => {
        // Define a sample reducer
        const reducer = (state: any) => state;

        // Create a sample class with the @Substore decorator
        @Substore(reducer)
        class TestComponent {}

        // Expect the LOCAL_REDUCER_KEY property to be set to the reducer
        expect((TestComponent as any)[LOCAL_REDUCER_KEY]).toBe(reducer);
    });
});
