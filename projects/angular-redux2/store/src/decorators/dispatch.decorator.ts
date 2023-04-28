/**
 * angular-redux2
 */

import { DecoratorFlagComponent } from '../components/decorator-flag.component';

/**
 * Decorator that automatically dispatches the return value of a decorated function
 * to the Redux store using `ngRedux.dispatch()`.
 *
 * ```typescript
 * // These dispatches will be scoped to the substore as well, as if you
 * // had called ngRedux.configureSubStore(...).dispatch(numLines).
 *
 * @Dispatch
 * addCode(numLines: any) {
 *     // Dispatching from the sub-store ensures this component instance's
 *     // subStore only sees the 'ADD_LOC' action.
 *     return { type: 'ADD_LOC', payload: numLines };
 * }
 * ```
 *
 * In the above example, the `addCode` function is decorated with `@Dispatch`.
 * Anytime the `addCode` function is called, its return value will automatically
 * be dispatched to the Redux store using `ngRedux.dispatch()`.
 *
 * @remarks
 * This decorator assumes that the component instance has an `ngRedux` property
 * that refers to a valid `NgRedux` instance. If the component instance does not
 * have an `ngRedux` property, an error will be thrown.
 *
 * @param {any} target - The target class instance.
 * @param {string | symbol | number} functionName - The name of the decorated function.
 * @param {PropertyDescriptor} descriptor - The object PropertyDescriptor.
 * @return The PropertyDescriptor.
 */

export function Dispatch(target: any, functionName: string | symbol | number, descriptor?: PropertyDescriptor): any {
    let originalMethod: any;
    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, functionName);

    const wrapped = function (this: any, ...args: any[]) {
        const result = originalMethod.apply(this, args);

        if (result !== false) {
            const instanceManager = new DecoratorFlagComponent(this);
            const store = instanceManager.store;

            if (store) {
                store.dispatch(result);
            }
        }

        return result;
    };

    /**
     * User for boundProperty | externalFunction
     * that can be undefined
     *
     *     @Dispatch
     *     externalFunction: (value: string) => any;
     *
     *     @Dispatch
     *     boundProperty = (value: string): any => ({
     *         type: 'TEST',
     *         payload: { value },
     *     });
     */

    if (descriptor === undefined) {
        const dispatchDescriptor: PropertyDescriptor = {
            get: () => wrapped,
            set: setMethod => (originalMethod = setMethod),
        };

        Object.defineProperty(target, functionName, dispatchDescriptor);

        return dispatchDescriptor;
    }

    originalMethod = descriptor.value;
    descriptor.value = wrapped;

    return descriptor;
}
