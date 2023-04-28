/**
 * Import third-party libraries
 */

import { BehaviorSubject } from 'rxjs';

/**
 * angular-redux2
 */

import { Select, Select$ } from './select.decorator';
import { DecoratorFlagComponent } from '../components/decorator-flag.component';

interface State {
    foo: string;
}

/**
 * Initialize global test mocks
 */

jest.mock('../components/decorator-flag.component');
const mockSelectStore = jest.fn();

(DecoratorFlagComponent as jest.Mock).mockImplementation(() => ({
    selections: {},
    store: {
        select: mockSelectStore
    }
}));

afterEach(() => {
    jest.clearAllMocks();
});

describe('Select', () => {
    test('should create a property decorator function', () => {
        expect(typeof Select).toBe('function');
    });

    test('should define a property on the target object', () => {
        const target = {};
        Select<State>(state => state.foo)(target, 'myProp');
        expect(target).toHaveProperty('myProp');
    });

    test('should return an observable when the property is accessed', () => {
        const store = {
            select: mockSelectStore.mockReturnValueOnce(new BehaviorSubject('foo'))
        };
        const instance: any = { store };
        Select<State>(state => state.foo)(instance, 'myProp');
        expect(instance.myProp.subscribe).toBeDefined();
    });
});

describe('Select$', () => {
    test('should create a property decorator function', () => {
        expect(typeof Select$).toBe('function');
    });

    test('should define a property on the target object', () => {
        const store = {
            select: mockSelectStore.mockReturnValueOnce(new BehaviorSubject('foo'))
        };
        const instance: any = { store };
        Select$<State>([ 'foo' ], obs$ => obs$)(instance, 'myProp');
        expect(instance).toHaveProperty('myProp');
    });

    test('should return an observable when the property is accessed', () => {
        const store = {
            select: mockSelectStore.mockReturnValueOnce(new BehaviorSubject('foo'))
        };
        const instance: any = { store };
        Select$<State>([ 'foo' ], obs$ => obs$)(instance, 'myProp');
        expect(instance.myProp.subscribe).toBeDefined();
    });
});
