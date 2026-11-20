/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction } from 'redux';

/**
 * Imports
 */

import { DecoratorFlagComponent } from '../components/decorator-flag.component';

/**
 * Dispatches the return value of the decorated method to the store.
 *
 * @param target - The prototype of the decorated class
 * @param functionName - The name of the decorated method or property
 * @param descriptor - The property descriptor of a method, absent for a property
 * @returns The descriptor that wraps the method or property
 *
 * @remarks
 * Every call runs the original function and dispatches its result, unless the result is exactly `false`.
 * The wrapper returns the result either way.
 * The store is the root {@link NgRedux} store,
 * or the substore of the instance when its class carries `Substore` and `basePath()` returns a path.
 * The decorator also works on a property that holds a function, such as an arrow function field,
 * by wrapping whatever function the property is assigned.
 * A call that dispatches before any {@link NgRedux} instance exists throws,
 * since the decorator reads the store through {@link NgRedux.store}.
 * Redux also throws for a result that is not a plain action, such as `undefined` from a method that returns nothing.
 *
 * @example
 * ```ts
 * class CounterComponent {
 *     @Dispatch
 *     increment(by: number) {
 *         return { type: 'INCREMENT', payload: by };
 *     }
 *
 *     @Dispatch
 *     reset = () => ({ type: 'RESET' });
 * }
 *
 * component.increment(2); // dispatches { type: 'INCREMENT', payload: 2 }
 * component.reset();      // dispatches { type: 'RESET' }
 * ```
 *
 * @see Substore
 * @see NgRedux.dispatch
 *
 * @since 5.0.0
 */

export function Dispatch(target: object, functionName: PropertyKey): void;
export function Dispatch(target: object, functionName: PropertyKey, descriptor: PropertyDescriptor): PropertyDescriptor;
export function Dispatch(target: object, functionName: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor {
    let originalMethod: (...args: Array<unknown>) => unknown;
    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, functionName);

    const wrapped = function (this: object, ...args: Array<unknown>): unknown {
        const result = originalMethod.apply(this, args);

        if (result !== false) {
            new DecoratorFlagComponent(this).store.dispatch(<UnknownAction> result);
        }

        return result;
    };

    /**
     * A property has no descriptor, so the decorator defines an accessor in its place.
     * The setter stores the assigned function, and the getter returns the dispatching wrapper,
     * which covers both a declared function property and an arrow function field.
     */

    if (descriptor === undefined) {
        const dispatchDescriptor: PropertyDescriptor = {
            get: () => wrapped,
            set: (setMethod: (...args: Array<unknown>) => unknown) => (originalMethod = setMethod)
        };

        Object.defineProperty(target, functionName, dispatchDescriptor);

        return dispatchDescriptor;
    }

    originalMethod = descriptor.value;
    descriptor.value = wrapped;

    return descriptor;
}
