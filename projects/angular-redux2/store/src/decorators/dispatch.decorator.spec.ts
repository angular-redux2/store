/**
 * angular-redux2
 */

import { Dispatch } from './dispatch.decorator';
import { DecoratorFlagComponent } from '../components/decorator-flag.component';

/**
 * Initialize global test mocks
 */

jest.mock('../components/decorator-flag.component');

class TestClass {
    @Dispatch
    addBug(numberOfLines: number): any {
        return { type: 'ADD_LOC', payload: numberOfLines };
    }

    @Dispatch
    emptyBug(): any {
        return null;
    }

    @Dispatch
    trueBug(): any {
        return true;
    }
}

describe('Dispatch', () => {
    let targetClass: any;
    const mockDispatch = jest.fn();

    beforeEach(() => {
        targetClass = new TestClass();
        (DecoratorFlagComponent as jest.Mock).mockImplementation(() => ({
            store: {
                dispatch: mockDispatch
            }
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should dispatch the result to the store when returning an object', () => {
        const result = targetClass.addBug(5);


        expect(result).toEqual({ type: 'ADD_LOC', payload: 5 });
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_LOC', payload: 5 });
    });

    test('should dispatch the result to the store when returning a falsy value', () => {
        const result = targetClass.emptyBug();

        expect(result).toBeNull();
        expect(mockDispatch).toHaveBeenCalledWith(null);
    });

    test('should dispatch the result to the store when returning a truthy value that is not an object', () => {
        const result = targetClass.trueBug();

        expect(result).toBe(true);
        expect(mockDispatch).toHaveBeenCalledWith(true);
    });

    test('should dispatch the result to the store when using an external function', () => {
        const functionName = 'testFunction';
        const externalFunction = jest.fn(() => ({ type: 'TEST', payload: { value: 'test' } }));

        Dispatch(targetClass, functionName);
        targetClass[functionName] = externalFunction;
        const result = targetClass[functionName]();


        expect(result).toEqual({ type: 'TEST', payload: { value: 'test' } });
        expect(externalFunction).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'TEST', payload: { value: 'test' } });
    });

    test('should dispatch the result to the store when using a bound property', () => {
        const functionName = 'testFunction';
        const boundProperty = jest.fn(() => ({ type: 'TEST', payload: { value: 'test' } }));

        Dispatch(targetClass, functionName);
        targetClass[functionName] = boundProperty;
        const result = targetClass[functionName]();

        expect(result).toEqual({ type: 'TEST', payload: { value: 'test' } });
        expect(boundProperty).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'TEST', payload: { value: 'test' } });
    });
});
