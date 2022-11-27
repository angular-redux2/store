/**
 * Import third-party libraries
 */

import { AnyAction } from "redux";

/**
 * Decorators
 */

import { Dispatch } from "./dispatch.decorator";

/**
 * Components
 */

import { DecoratorFlagComponent } from '../components/decorator-flag.component';

/**
 * Initialize global test invariant variable
 */

class TestClass {
    @Dispatch
    addBug(numberOfLines: number): AnyAction {
        return { type: 'ADD_LOC', payload: numberOfLines };
    }

    @Dispatch
    emptyBug(numberOfLines: number): any {
    }

    @Dispatch
    boundProperty: (arg: string) => any;
}

/**
 * Initialize global test mocks
 */

jest.mock('../components/decorator-flag.component');

/**
 * Initialize global test mocks
 */

beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
});

test('Should call to DecoratorFlagComponent.', () => {
    const testClass = new TestClass();
    testClass.addBug(5);

    expect(DecoratorFlagComponent).toBeCalled();
});

test('Should call to store dispatch.', () => {
    const mockStore = jest.fn();

    (DecoratorFlagComponent as jest.Mock).mockImplementation(() => ({
        store: {
            dispatch: mockStore
        }
    }));

    const testClass = new TestClass();
    testClass.addBug(5);

    expect(mockStore).toBeCalledWith( {"payload": 5, "type": "ADD_LOC"});
});

test('Should return null.', () => {
    const testClass = new TestClass();
    expect(testClass.emptyBug(5)).toStrictEqual( undefined);
});

test('Should create descriptor if is undefined.', () => {
    const testClass = new TestClass();
    testClass.boundProperty = (arg: string): any => {
        return arg;
    }
    expect(testClass.boundProperty('test')).toStrictEqual( 'test');
});
