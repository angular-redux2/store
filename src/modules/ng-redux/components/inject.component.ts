/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Reducer } from 'redux';
import type { CreateComputedOptions, Signal } from '@angular/core';
import type { BasePathType, SelectorType, SubStoreInterface } from '../../../interfaces/store.interface';

/**
 * Imports
 */

import { DestroyRef, inject } from '@angular/core';
import { NgRedux } from '../../../services/ng-redux.service';

/**
 * Selects one value of the root state as a signal, from inside an injection context.
 *
 * @typeParam State - The type of the root state, inferred from the selector parameter
 * @typeParam Selected - The value that the selector returns
 * @param selector - The function that picks the value
 * @param options - The options passed to the underlying `computed`
 * @returns A read-only signal of the selected value
 *
 * @remarks
 * It is a shorthand for `inject(NgRedux).select(selector, options)`,
 * so call it in a field initializer or a constructor.
 * Annotate the selector parameter with the state type, and TypeScript infers the selected type.
 *
 * @example
 * ```ts
 * class Counter {
 *     readonly count = injectSelect((state: AppState) => state.counter);
 * }
 *
 * counter.count(); // 0
 * ```
 *
 * @see NgRedux.select
 *
 * @since 6.0.0
 */

export function injectSelect<State, Selected>(
    selector: SelectorType<State, Selected>, options?: CreateComputedOptions<Selected>
): Signal<Selected> {
    return (<NgRedux<State>> inject(NgRedux)).select(selector, options);
}

/**
 * Creates a substore on the root store, from inside an injection context.
 *
 * @typeParam SubState - The state of the branch
 * @param basePath - The path of the branch, fixed or computed
 * @param reducer - The reducer that handles the actions dispatched through the substore
 * @returns A store for the branch at the base path
 *
 * @remarks
 * It is a shorthand for `inject(NgRedux).substore(basePath, reducer)`.
 * Pass a function to follow a signal input, since the path is read again whenever one of its signals changes.
 * The substore is destroyed with the injector that created it, such as the component,
 * so the root store can forget its reducer.
 *
 * @example
 * ```ts
 * class User {
 *     readonly userId = input.required<string>();
 *     readonly user = injectSubstore(() => [ 'users', this.userId() ], userReducer);
 *     readonly loc = this.user.select(user => user.loc);
 * }
 * ```
 *
 * @see NgRedux.substore
 *
 * @since 6.0.0
 */

export function injectSubstore<SubState>(basePath: BasePathType, reducer: Reducer<SubState>): SubStoreInterface<SubState> {
    const substore = inject(NgRedux).substore(basePath, reducer);
    inject(DestroyRef).onDestroy(() => substore.destroy());

    return substore;
}
