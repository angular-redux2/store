/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Signal } from '@angular/core';
import type { ComparatorType, SelectorType } from '../interfaces/store.interface';

/**
 * Imports
 */

import { inject } from '@angular/core';
import { NgRedux } from '../services/ng-redux.service';

/**
 * Selects a slice of the root state as a signal, from an injection context.
 *
 * @typeParam T - The type of the selected value
 * @typeParam RootState - The type of the state a function selector reads, inferred from its parameter
 * @param selector - The key, path, or function that locates the value, or nothing for the whole state
 * @param comparator - The equality check that decides whether a new value is a change
 * @returns A read-only signal of the selected value
 *
 * @remarks
 * It is the decorator-free counterpart of {@link Select}: call it in a field initializer or a constructor.
 * Unlike the decorators, it works with any `useDefineForClassFields` setting,
 * and in tests it reads the selector stubs of `MockNgRedux`, since it injects {@link NgRedux}.
 * It is a shorthand for `inject(NgRedux).selectSignal(selector, comparator)`.
 *
 * @example
 * ```ts
 * @Component({ template: '{{ count() }} / {{ name() }}' })
 * class CounterComponent {
 *     readonly count = injectSelect<number>('count');
 *     readonly name = injectSelect((state: AppState) => state.user.name);
 * }
 * ```
 *
 * @see NgRedux.selectSignal
 * @see Select
 *
 * @since 6.0.0
 */

export function injectSelect<T, RootState = unknown>(selector?: SelectorType<RootState, T>, comparator?: ComparatorType<T>): Signal<T> {
    return inject(NgRedux<RootState>).selectSignal(selector, comparator);
}
