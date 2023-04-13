/**
 * Import third-party types
 */

import type { AnyAction, Reducer } from 'redux';

/**
 * Angular-redux
 */

import { LOCAL_REDUCER_KEY } from '../interfaces/fractal.interface';

/**
 * A decorator function that modifies the behavior of any `@Select`, `@Select$`, or `@Dispatch`
 * decorators to operate on a substore defined with a given reducer.
 *
 * @example
 * ```typescript
 * @SubStore(userComponentReducer)
 * export class TestComponent implements OnInit {
 *     @Input() userId: String;
 *
 *     // The substore will be created from the return value of this function.
 *     getBasePath(): Array<string | String> | null {
 *         return this.userId ? ['users', this.userId] : null;
 *     }
 * }
 * ```
 *
 * @param reducer - The reducer function used to create the substore.
 * @returns A ClassDecorator function that sets the reducer to the class constructor's LOCAL_REDUCER_KEY property.
 */

export function Substore(reducer: Reducer<any, AnyAction>): ClassDecorator {
    return function decorate(constructor: any): void {
        constructor[LOCAL_REDUCER_KEY] = reducer;
    };
}
