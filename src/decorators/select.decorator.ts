/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Observable } from 'rxjs';
import type { Signal } from '@angular/core';
import type { TransformerType } from '../interfaces/store.interface';
import type { ComparatorType, SelectorType } from '../interfaces/store.interface';

/**
 * Imports
 */

import { distinctUntilChanged } from 'rxjs';
import { DecoratorFlagComponent } from '../components/decorator-flag.component';

/**
 * Replaces the decorated property with an observable of a slice of the state.
 *
 * @typeParam T - The type of the selected value
 * @typeParam RootState - The type of the state a function selector reads, inferred from its parameter
 * @param selector - The key, path, or function that locates the value, defaulting to the property name
 * @param comparator - The equality check that decides whether a new value is emitted
 * @returns A property decorator
 *
 * @remarks
 * Without a selector, the property name becomes a property selector, with one trailing `$` removed,
 * so `count$` selects `count`.
 * The property turns into a getter that creates the observable on first read and returns the same one afterward.
 * The observable comes from the substore when the class carries `Substore` and `basePath()` returns a path,
 * and from the root {@link NgRedux} store otherwise.
 * The first read fixes the store, so a later change of `basePath()` does not reach a property that was already read.
 *
 * @example
 * ```ts
 * class CounterComponent {
 *     @Select() readonly count$: Observable<number>;                  // selects 'count'
 *     @Select([ 'user', 'name' ]) readonly name$: Observable<string>; // selects a path
 *     @Select(state => state.items.length) readonly size$: Observable<number>;
 * }
 * ```
 *
 * @see Select$
 * @see SelectorType
 * @see Substore
 *
 * @since 5.0.0
 */

export function Select<T, RootState = unknown>(selector?: SelectorType<RootState, T>, comparator?: ComparatorType<T>): PropertyDecorator {
    return (target: object, name: string | symbol): void =>
        createSelectDecorator<RootState, T, T>(selector ?? String(name).replace(/\$\s*$/, ''), comparator)(target, name);
}

/**
 * Replaces the decorated property with a signal of a slice of the state.
 *
 * @typeParam T - The type of the selected value
 * @typeParam RootState - The type of the state a function selector reads, inferred from its parameter
 * @param selector - The key, path, or function that locates the value, defaulting to the property name
 * @param comparator - The equality check that decides whether a new value is a change
 * @returns A property decorator
 *
 * @remarks
 * It is the signal counterpart of {@link Select}, built on `selectSignal`, so a template reads the value without
 * the `async` pipe and without a subscription.
 * Without a selector, the property name becomes a property selector as it is, so `count` selects `count`.
 * The property turns into a getter that creates the signal on first read and returns the same one afterward,
 * from the substore when the class carries `Substore` and from the root {@link NgRedux} store otherwise.
 * Like the other decorators, it needs `useDefineForClassFields: false`, and {@link injectSelect} is the alternative
 * that works without it.
 *
 * @example
 * ```ts
 * @Component({ template: '{{ count() }} / {{ name() }}' })
 * class CounterComponent {
 *     @SelectSignal() readonly count: Signal<number>;                  // selects 'count'
 *     @SelectSignal([ 'user', 'name' ]) readonly name: Signal<string>; // selects a path
 * }
 * ```
 *
 * @see Select
 * @see injectSelect
 * @see AbstractStore.selectSignal
 *
 * @since 6.0.0
 */

export function SelectSignal<T, RootState = unknown>(selector?: SelectorType<RootState, T>, comparator?: ComparatorType<T>): PropertyDecorator {
    return (target: object, name: string | symbol): void => {
        Object.defineProperty(target, name, {
            get(this: object): Signal<unknown> {
                const flags = new DecoratorFlagComponent(this);

                return <Signal<unknown>> (flags.selections[name] ??= flags.store.selectSignal(
                    <SelectorType<unknown, T>> (selector ?? String(name)),
                    comparator
                ));
            },
            enumerable: true,
            configurable: true
        });
    };
}

/**
 * Replaces the decorated property with a selection that runs through an observable transformer.
 *
 * @typeParam S - The type of the selected value that the transformer receives
 * @typeParam T - The type of the value that the transformed observable emits
 * @typeParam RootState - The type of the state a function selector reads, inferred from its parameter
 * @param selector - The key, path, or function that locates the value
 * @param transformer - The function that derives a new observable from the selection
 * @param comparator - The equality check applied after the transformer
 * @returns A property decorator
 *
 * @remarks
 * Reach for it over {@link Select} when the value needs an RxJS operator, such as a debounce, rather than a mapping.
 * The transformer receives the selection and the decorated instance,
 * and its result goes through `distinctUntilChanged` with the optional comparator.
 * The selector is required here, since the property name is not used as a default.
 * Store lookup and caching work the same as for {@link Select}.
 *
 * @example
 * ```ts
 * const debounceAndTriple: TransformerType<number, number> = (count$) => count$.pipe(
 *     debounceTime(300),
 *     map(count => count * 3)
 * );
 *
 * class CounterComponent {
 *     @Select$('count', debounceAndTriple) readonly tripled$: Observable<number>;
 * }
 * ```
 *
 * @see Select
 * @see TransformerType
 *
 * @since 5.0.0
 */

export function Select$<S, T = S, RootState = unknown>(
    selector: SelectorType<RootState, S>,
    transformer: TransformerType<S, T>,
    comparator?: ComparatorType<T>
): PropertyDecorator {
    return createSelectDecorator(selector, comparator, transformer);
}

/**
 * Builds the property decorator that both {@link Select} and {@link Select$} return.
 *
 * @typeParam RootState - The type of the state a function selector reads
 * @typeParam S - The type of the selected value
 * @typeParam T - The type of the value the transformer emits
 * @param selector - The key, path, or function that locates the value
 * @param comparator - The equality check that decides whether a new value is emitted
 * @param transformer - The optional function that derives a new observable from the selection
 * @returns A property decorator that turns the property into a getter
 *
 * @remarks
 * The decorator defines an enumerable, configurable getter for the property on the prototype.
 * The getter delegates to {@link getInstanceSelection}, which resolves and caches the observable per instance.
 *
 * @hidden
 * @since 5.0.0
 */

function createSelectDecorator<RootState, S, T>(
    selector: SelectorType<RootState, S>,
    comparator?: ComparatorType<T>,
    transformer?: TransformerType<S, T>
): PropertyDecorator {
    return function decorator(target: object, name: string | symbol): void {
        function getter(this: object): Observable<unknown> {
            return getInstanceSelection(this, name, selector, transformer, comparator);
        }

        Object.defineProperty(target, name, {
            get: getter,
            enumerable: true,
            configurable: true
        });
    };
}

/**
 * Returns the cached observable of a decorated property, creating it on the first read.
 *
 * @typeParam RootState - The type of the state a function selector reads
 * @typeParam S - The type of the selected value
 * @typeParam T - The type of the value the transformer emits
 * @param decoratedInstance - The instance whose property is being read
 * @param name - The name of the decorated property, which keys the cache
 * @param selector - The key, path, or function that locates the value
 * @param transformer - The optional function that derives a new observable from the selection
 * @param comparator - The equality check that decides whether a new value is emitted
 * @returns The observable for the property
 *
 * @remarks
 * The store comes from {@link DecoratorFlagComponent}, so it is the substore of the instance when one applies.
 * With a transformer, the selection runs without the comparator,
 * and the comparator applies to the transformed observable instead.
 * The result is stored in the selection cache of the instance, so later reads skip the store entirely.
 *
 * @hidden
 * @since 5.0.0
 */

function getInstanceSelection<RootState, S, T>(
    decoratedInstance: object,
    name: string | symbol,
    selector: SelectorType<RootState, S>,
    transformer?: TransformerType<S, T>,
    comparator?: ComparatorType<T>
): Observable<unknown> {
    const flags = new DecoratorFlagComponent(decoratedInstance);

    return <Observable<unknown>> (flags.selections[name] ??= transformer
        ? flags.store.select(<SelectorType<unknown, S>> selector).pipe(
            (obs$: Observable<S>) => transformer(obs$, decoratedInstance),
            distinctUntilChanged(comparator)
        ) : flags.store.select(<SelectorType<unknown, S>> selector, <ComparatorType<S> | undefined> <unknown> comparator));
}
