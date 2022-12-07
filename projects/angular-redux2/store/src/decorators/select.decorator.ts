/**
 * Import third-party libraries
 */

import { distinctUntilChanged, Observable } from 'rxjs';

/**
 * Interfaces
 */

import { Comparator, Selector, Transformer } from '../interfaces/store.interface';

/**
 * Components
 */

import { DecoratorFlagComponent } from '../components/decorator-flag.component';

/**
 * Selects an observable from the store, and attaches it to the decorated property.
 *
 * ```ts
 *  import { select } from '@angular-redux2/store';
 *
 *  class SomeClass {
 *      @Select(['foo','bar']) foo$: Observable<string>
 * }
 * ```
 *
 * @param selector -
 * A selector function, property name string, or property name path
 * (array of strings/array indices) that locates the store data to be
 * selected
 *
 * @param comparator - Function used to determine if this selector has changed.
 */

export function Select<T>(selector?: Selector<any, T>, comparator?: Comparator): PropertyDecorator {
    return (target: any, name: string | symbol): void => {
        if (!selector) {
            // remove $ from the name.
            selector = String(name).replace(/\$\s*$/, '');
        }

        return decorate(selector, comparator)(target, name);
    };
}

/**
 * Selects an observable using the given path selector, and runs it through the
 * given transformer function. A transformer function takes the store
 * observable as an input and returns a derived observable from it. That derived
 *  observable is run through distinctUntilChanges with the given optional
 * comparator and attached to the store property.
 *
 * `Think of a Transformer as a FunctionSelector that operates on observables
 * instead of values.`
 *
 * ```ts
 * import { select$ } from 'angular-redux2/store';
 *
 * export const debounceAndTriple = obs$ => obs$
 *  .debounce(300)
 *  .map(x => 3 * x);
 *
 * class Foo {
 *      @Select$(['foo', 'bar'], debounceAndTriple)
 *      readonly debouncedFooBar$: Observable<number>;
 * }
 * ```
 *
 * @param selector -
 * A selector function, property name string, or property name path
 * (array of strings/array indices) that locates the store data to be
 * selected
 *
 * @param comparator - Function used to determine if this selector has changed.
 * @param transformer - transformer that operates on observables instead of values.
 */

export function Select$<T>(
    selector: Selector<any, T>,
    transformer: Transformer<any, T>,
    comparator?: Comparator
): PropertyDecorator {
    return decorate(selector, comparator, transformer);
}

/**
 * Selects an observable using the given path selector, and runs it through the
 * given transformer function. A transformer function takes the store
 * observable as an input and returns a derived observable from it.
 *
 * @param selector -
 * A selector function, property name string, or property name path
 * (array of strings/array indices) that locates the store data to be
 * selected
 *
 * @param comparator - Function used to determine if this selector has changed.
 * @param transformer - transformer that operates on observables instead of values.
 * @hidden
 */

function decorate(
    selector: Selector<any, any>,
    comparator?: Comparator,
    transformer?: Transformer<any, any>,
): PropertyDecorator {
    return function decorator(target: any, name: string | symbol): void {
        function getter(this: any) {
            return getInstanceSelection(this, name, selector, <any>transformer, comparator);
        }

        // Replace decorated property with a getter that returns the observable.
        if (delete target[name]) {
            Object.defineProperty(target, name, {
                get: getter,
                enumerable: true,
                configurable: true,
            });
        }
    };
}

/**
 * Call store (root or substore) select with path.
 *
 * @param decoratedInstance - decorator instance
 * @param name - string | symbol are use in select decorator (foo$) @Select(['foo','bar']) `foo$`: Observable<string>.
 * @param selector - select path in decorator.
 * @param comparator - Function used to determine if this selector has changed.
 * @param transformer - transformer that operates on observables instead of values.
 * @hidden
 */

function getInstanceSelection<T>(
    decoratedInstance: any,
    name: string | symbol,
    selector: Selector<any, T>,
    transformer?: Transformer<any, T>,
    comparator?: Comparator
): Observable<any> | undefined {
    const instanceManager = new DecoratorFlagComponent(decoratedInstance);
    const store = instanceManager.store;
    const selections = instanceManager.selections;

    if (selections[name]) {
        return selections[name];
    }

    if (!store) {
        return undefined;
    }

    if (transformer) {
        selections[name] = store.select(selector).pipe(
            (obs$: any) => (transformer as any)(obs$, decoratedInstance),
            distinctUntilChanged(comparator)
        );
    } else {
        selections[name] = store.select(selector, comparator);
    }

    return selections[name];
}
