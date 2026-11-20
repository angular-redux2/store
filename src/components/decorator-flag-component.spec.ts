/**
 * Imports
 */

import { NgRedux } from '@services/ng-redux.service';
import { DecoratorFlagComponent } from '@components/decorator-flag.component';
import { LOCAL_REDUCER_KEY, SELECTION_KEY } from '@interfaces/fractal.interface';

describe('DecoratorFlagComponent', () => {
    describe('reducer getter', () => {
        test('should return the correct reducer if it exists', () => {
            const reducer = (state: any) => state;
            const instance = new DecoratorFlagComponent({ constructor: { [LOCAL_REDUCER_KEY]: reducer } });
            expect(instance.reducer).toBe(reducer);
        });

        test('should return undefined if no reducer exists', () => {
            const instance = new DecoratorFlagComponent({ constructor: {} });
            expect(instance.reducer).toBeUndefined();
        });
    });

    describe('basePath getter', () => {
        test('should return the base path selector when basePath is a function', () => {
            const basePathFn = xJet.fn(() => [ 'foo', 'bar' ]);
            const instance = { basePath: basePathFn };
            const component = new DecoratorFlagComponent(instance);
            const result = component.basePath;
            expect(basePathFn).toHaveBeenCalled();
            expect(result).toEqual([ 'foo', 'bar' ]);
        });

        test('should return undefined when basePath is not a function', () => {
            const instance = { basePath: [ 'foo', 'bar' ] };
            const component = new DecoratorFlagComponent(instance);
            const result = component.basePath;
            expect(result).toBeUndefined();
        });
    });

    describe('selections getter', () => {
        test('should return the selection object associated with the decorated instance', () => {
            const decoratedInstance = {
                [SELECTION_KEY]: {
                    prop1: 'value1',
                    prop2: 'value2'
                }
            };
            const component = new DecoratorFlagComponent(decoratedInstance);

            expect(component.selections).toEqual({
                prop1: 'value1',
                prop2: 'value2'
            });
        });
    });

    describe('store getter', () => {
        let ngReduxStoreMock: any;

        beforeEach(() => {
            ngReduxStoreMock = {
                configureSubStore: xJet.fn()
            };

            (NgRedux as any).instance = ngReduxStoreMock;
        });

        afterEach(() => {
            (NgRedux as any).instance = undefined;
        });

        test('should return the global store when there is no reducer or base path', () => {
            const decoratedInstance = {};
            const component = new DecoratorFlagComponent(decoratedInstance);
            expect(component.store).toBe(ngReduxStoreMock);
            expect(ngReduxStoreMock.configureSubStore).not.toHaveBeenCalled();
        });

        test('should return a substore instance when there is a reducer and base path', () => {
            const reducer = xJet.fn();
            const basePath = xJet.fn(() => [ 'some', 'path' ]);
            const substoreMock = {};

            ngReduxStoreMock.configureSubStore.mockReturnValue(substoreMock);
            const decoratedInstance = { basePath };
            Object.defineProperty(decoratedInstance.constructor, LOCAL_REDUCER_KEY, {
                value: reducer,
                writable: true
            });
            const component = new DecoratorFlagComponent(decoratedInstance);

            expect(component.store).toBe(substoreMock);
            expect(ngReduxStoreMock.configureSubStore).toHaveBeenCalledWith([ 'some', 'path' ], reducer);
        });
    });
});
