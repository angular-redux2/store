/**
 * Angular-redux
 */

import { NgRedux } from '../services/ng-redux.service';
import { DecoratorFlagComponent } from './decorator-flag.component';
import { LOCAL_REDUCER_KEY, SELECTION_KEY, SUBSTORE_KEY } from '../interfaces/fractal.interface';

describe('DecoratorFlagComponent', () => {
    describe('reducer getter', () => {
        test('should return the correct reducer if it exists', () => {
            const reducer = (state: any, action: any) => state;
            const instance = new DecoratorFlagComponent({ constructor: { [LOCAL_REDUCER_KEY]: reducer } });
            expect(instance.reducer).toBe(reducer);
        });

        test('should return undefined if no reducer exists', () => {
            const instance = new DecoratorFlagComponent({ constructor: {} });
            expect(instance.reducer).toBeUndefined();
        });
    });

    describe('basePath getter', () => {
        it('should return the base path selector when basePath is a function', () => {
            const basePathFn = jest.fn(() => ['foo', 'bar']);
            const instance = { basePath: basePathFn };
            const component = new DecoratorFlagComponent(instance);
            const result = component.basePath;
            expect(basePathFn).toHaveBeenCalled();
            expect(result).toEqual(['foo', 'bar']);
        });

        it('should return undefined when basePath is not a function', () => {
            const instance = { basePath: ['foo', 'bar'] };
            const component = new DecoratorFlagComponent(instance);
            const result = component.basePath;
            expect(result).toBeUndefined();
        });
    });

    describe('selections getter', () => {
        it('should return the selection object associated with the decorated instance', () => {
            const decoratedInstance = {
                [SELECTION_KEY]: {
                    prop1: 'value1',
                    prop2: 'value2',
                },
            };
            const component = new DecoratorFlagComponent(decoratedInstance);

            expect(component.selections).toEqual({
                prop1: 'value1',
                prop2: 'value2',
            });
        });
    });

    describe('store getter', () => {
        let ngReduxMock: any;
        let ngReduxStoreMock: any;
        const ngStoreSpy = jest.spyOn(NgRedux, 'store', 'get');

        beforeEach(() => {
            ngReduxStoreMock = {
                configureSubStore: jest.fn()
            };
            ngReduxMock = {
                get store() {
                    return ngReduxStoreMock;
                }
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should return the global store when there is no reducer or base path', () => {
            const decoratedInstance = {};
            const component = new DecoratorFlagComponent(decoratedInstance);
            ngStoreSpy.mockReturnValueOnce(ngReduxStoreMock)

            expect(component.store).toBe(ngReduxStoreMock);
            expect(ngReduxStoreMock.configureSubStore).not.toHaveBeenCalled();
        });

        it('should return a substore instance when there is a reducer and base path', () => {
            const reducer = jest.fn();
            const basePath = jest.fn(() => ['some', 'path']);
            const substoreMock = {};

            ngReduxStoreMock.configureSubStore.mockReturnValue(substoreMock);
            ngStoreSpy.mockReturnValueOnce(ngReduxStoreMock)

            const decoratedInstance = { basePath };
            Object.defineProperty(decoratedInstance.constructor, LOCAL_REDUCER_KEY, {
                value: reducer,
                writable: true
            });
            const component = new DecoratorFlagComponent(decoratedInstance);

            expect(component.store).toBe(substoreMock);
            expect(ngReduxStoreMock.configureSubStore).toHaveBeenCalledWith(['some', 'path'], reducer);
        });
    });
});
