/**
 * Import decorators
 */

import { getBaseStore } from './fractal.decorator';

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
 */

export function Dispatch(target: any, key: string | symbol | number, descriptor?: PropertyDescriptor): any {
    let originalMethod: Function;

    const wrapped = function (this: any, ...args: any[]) {
        const result = originalMethod.apply(this, args);

        if (result !== false) {
            const store = getBaseStore(this);

            if (store) {
                store.dispatch(result);
            }
        }

        return result;
    };

    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, key);

    if (descriptor === undefined) {
        const dispatchDescriptor: PropertyDescriptor = {
            get: () => wrapped,
            set: setMethod => (originalMethod = setMethod),
        };

        Object.defineProperty(target, key, dispatchDescriptor);

        return dispatchDescriptor;
    } else {
        originalMethod = descriptor.value;
        descriptor.value = wrapped;

        return descriptor;
    }
}
