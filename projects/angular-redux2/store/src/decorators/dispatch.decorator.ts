/**
 * Components
 */

import { DecoratorFlagComponent } from '../components/decorator-flag.component';

/**
 * Auto-dispatches the return value of the decorated function.
 * Decorate a function creator method with @Dispatch and its return
 * value will automatically be passed to ngRedux.dispatch() for you.
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
 * @param target - target reducer class instance.
 * @param functionName - function name as action name.
 * @param descriptor - object PropertyDescriptor
 * @return PropertyDescriptor
 */

export function Dispatch(target: any, functionName: string | symbol | number, descriptor?: PropertyDescriptor): any {
    let originalMethod: Function;
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
