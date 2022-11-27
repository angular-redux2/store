/**
 * Import third-party libraries
 */

import { Observable } from "rxjs";

/**
 * Decorator's
 */

import { Select, Select$ } from './select.decorator';

/**
 * Components
 */

import { DecoratorFlagComponent } from '../components/decorator-flag.component';

/**
 * Initialize global test invariant variable
 */

const mockTransformer = jest.fn();
const mockSelectStore = jest.fn();

/**
 * Initialize global test mocks
 */

jest.mock('../components/decorator-flag.component')

class MockClass {
    @Select()
    empty$: Observable<number>;

    @Select('username')
    users$: Observable<number>;

    @Select$('username', mockTransformer)
    user$: Observable<number>;
}


(DecoratorFlagComponent as jest.Mock).mockImplementation(() => ({
    selections: {},
    store: {
        select: mockSelectStore
    }
}));


/**
 * After-each test
 */

afterEach(() => {
    jest.clearAllMocks();
});

test('Should remove $ from variable name and use-it as selector.', () => {
    const mockInstance = new MockClass();
    const result = mockInstance.empty$;

    expect(mockSelectStore).toBeCalledWith('empty', undefined);
});

test('Should call store select with arguments.', () => {
    const mockInstance = new MockClass();
    const result = mockInstance.users$;

    expect(mockSelectStore).toBeCalledWith('username', undefined);
});

test('Should return undefined if store is undefined.', () => {
    (DecoratorFlagComponent as jest.Mock).mockImplementation(() => ({
        selections: {},
        store: undefined
    }));

    const mockInstance = new MockClass();

    expect(mockInstance.users$).toStrictEqual(undefined);
});

test('Should return select value from cache.', () => {
    (DecoratorFlagComponent as jest.Mock).mockImplementation(() => ({
        selections: {
            users$: 'test'
        },
        store: undefined
    }));

    const mockInstance = new MockClass();

    expect(mockInstance.users$).toStrictEqual('test');
});

test('Should call pipe when transformer is set.', () => {
    const mockPipe = jest.fn();
    (DecoratorFlagComponent as jest.Mock).mockImplementation(() => ({
        selections: {},
        store: {
            select: () => {
                return {
                    pipe: mockPipe
                }
            }
        }
    }));

    const mockInstance = new MockClass();
    const result = mockInstance.user$;

    expect(mockPipe).toBeCalled();
});

test('Should call transformer if is set.', () => {
    const mockPipe = jest.fn();
    (DecoratorFlagComponent as jest.Mock).mockImplementation(() => ({
        selections: {},
        store: {
            select: () => {
                return {
                    pipe: (OperatorFunction: any, OperatorFunction2: any) => {
                        OperatorFunction();
                    }
                }
            }
        }
    }));

    const mockInstance = new MockClass();
    const result = mockInstance.user$;

    expect(mockTransformer).toBeCalled();
});
