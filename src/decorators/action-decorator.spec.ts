/**
 * angular-redux2
 */

import { Action } from './action.decorator';

describe('Action', () => {
    class ExampleReducer {
        static actions: any;

        @Action
        exampleFunction(payload: any) {
            return payload;
        }
    }

    test('should create an action creator for a specific function', () => {
        expect(ExampleReducer.actions.exampleFunction('test payload')).toEqual({
            type: 'ExampleReducer/exampleFunction',
            payload: 'test payload',
        });
    });

    test('TestReducer.addBug() should return an action object with the correct type and payload', () => {
        // Instantiate the test subject
        new ExampleReducer();

        // Call the action creator without a payload
        const result = (ExampleReducer as any).actions['exampleFunction']();

        // Call the action creator with a payload
        const resultPayload = (ExampleReducer as any).actions['exampleFunction']({ test: 'test' });

        // Assert that the action creator without a payload returns an action object with the correct type and no payload
        expect(result).toEqual({
            type: 'ExampleReducer/exampleFunction'
        });

        // Assert that the action creator with a payload returns an action object with the correct type and payload
        expect(resultPayload).toEqual({
            type: 'ExampleReducer/exampleFunction',
            payload: { test: 'test' }
        });
    });
});
