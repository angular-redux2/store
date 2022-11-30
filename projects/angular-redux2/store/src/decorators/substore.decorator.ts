/**
 * Import third-party libraries
 */

import { AnyAction, Reducer } from 'redux';

/**
 * Interfaces
 */

import { LOCAL_REDUCER_KEY } from '../interfaces/fractal.interface';

/**
 * Modifies the behaviour of any `@Select`, `@Select$`, or `@Dispatch`
 * decorators to operate on a substore defined.
 *
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
 */

export function Substore(reducer: Reducer<any, AnyAction>): ClassDecorator {
    return function decorate(constructor: any): void {
        constructor[LOCAL_REDUCER_KEY] = reducer;
    };
}
