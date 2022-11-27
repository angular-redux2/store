/**
 * Services
 */

import { NgRedux } from '../services/ng-redux.service';

/**
 * Components
 */

import { DecoratorFlagComponent } from './decorator-flag.component';

/**
 * Interfaces
 */

import { LOCAL_REDUCER_KEY, SELECTION_KEY, SUBSTORE_KEY } from '../interfaces/fractal.interface';

/**
 * Initialize global test invariant variable
 */

class TestClass {
}

const mockGetBasePath = jest.fn();
const testInstance: any = new TestClass();
const mockNgStore = jest.spyOn(NgRedux, 'store', 'get');

/**
 * Initialize global test mocks
 */


const instance: any = new DecoratorFlagComponent(testInstance);

/**
 * Clear all jest mock
 */

afterEach(() => {
    jest.clearAllMocks();
    testInstance.getBasePath = mockGetBasePath;
});


test('Should return local reducer is undefined.', () => {
    expect(instance.reducer).toStrictEqual(undefined);
});

test('Should return local reducer.', () => {
    testInstance.constructor[LOCAL_REDUCER_KEY] = 'reducer';

    expect(instance.reducer).toStrictEqual('reducer');
});

test('Should return base path is undefined.', () => {
    testInstance.getBasePath = undefined;
    expect(instance.basePath).toStrictEqual(undefined);
});

test('Should return base path.', () => {
    testInstance.getBasePath();
    expect(mockGetBasePath).toBeCalled();
});

test('Should return cache selector empty object.', () => {
    expect(instance.selections).toStrictEqual({});
});

test('Should return cache selector object.', () => {
    const testFunction = jest.fn();
    testInstance[SELECTION_KEY] = {
        test: testFunction
    };

    instance.selections['test']();
    expect(testFunction).toBeCalled();
});

test('Should return NgRedux root store.', () => {
    new NgRedux();
    instance.store;
    expect(mockNgStore).toBeCalled();
});

test('Should return factory sub-store.', () => {
    const mockConfigureSubStore = jest.fn();
    mockGetBasePath.mockReturnValueOnce(['a', 'b']);
    testInstance.constructor[LOCAL_REDUCER_KEY] = jest.fn();

    mockNgStore.mockReturnValueOnce(<any>{
        configureSubStore: mockConfigureSubStore
    })

    instance.store;
    expect(mockConfigureSubStore).toBeCalled();
});

test('Should return cache sub-store.', () => {
    const mockInstance = jest.fn();
    mockGetBasePath.mockReturnValueOnce(['a', 'b']);
    testInstance.constructor[LOCAL_REDUCER_KEY] = jest.fn();
    testInstance[SUBSTORE_KEY] = {
        cachePath: (['a', 'b'] || []).toString(),
        instance: mockInstance
    };

    expect(instance.store).toStrictEqual(mockInstance);
});

test('Should return factory sub-store (instance not exists).', () => {
    const mockInstance = jest.fn();
    const mockConfigureSubStore = jest.fn();

    mockGetBasePath.mockReturnValueOnce(['a', 'b']);
    testInstance.constructor[LOCAL_REDUCER_KEY] = jest.fn();
    testInstance[SUBSTORE_KEY] = {
        cachePath: (['a', 'b'] || []).toString()
    };

    mockNgStore.mockReturnValueOnce(<any>{
        configureSubStore: mockConfigureSubStore
    });

    instance.store;
    expect(mockConfigureSubStore).toBeCalled();
});
