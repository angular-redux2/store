/**
 * Imports
 */

import { BehaviorSubject } from 'rxjs';
import { Select, Select$ } from '@decorators/select.decorator';
import { DecoratorFlagComponent } from '@components/decorator-flag.component';

interface StateInterface {
    foo: string;
}

/**
 * Initialize global test mocks
 */

const mockSelectStore = xJet.fn();

xJet.mock(DecoratorFlagComponent, () => <any> {
    selections: {},
    store: {
        select: mockSelectStore
    }
});

afterEach(() => {
    xJet.clearAllMocks();
});

describe('Select', () => {
    test('should create a property decorator function', () => {
        expect(typeof Select).toBe('function');
    });

    test('should define a property on the target object', () => {
        const target = {};
        Select((state: StateInterface) => state.foo)(target, 'myProp');
        expect(target).toHaveProperty('myProp');
    });

    test('should return an observable when the property is accessed', () => {
        const store = {
            select: mockSelectStore.mockReturnValueOnce(new BehaviorSubject('foo'))
        };
        const instance: any = { store };
        Select((state: StateInterface) => state.foo)(instance, 'myProp');
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
        Select$<StateInterface>([ 'foo' ], obs$ => obs$)(instance, 'myProp');
        expect(instance).toHaveProperty('myProp');
    });

    test('should return an observable when the property is accessed', () => {
        const store = {
            select: mockSelectStore.mockReturnValueOnce(new BehaviorSubject('foo'))
        };
        const instance: any = { store };
        Select$<StateInterface>([ 'foo' ], obs$ => obs$)(instance, 'myProp');
        expect(instance.myProp.subscribe).toBeDefined();
    });
});
