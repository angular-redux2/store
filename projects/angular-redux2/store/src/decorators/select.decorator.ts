/**
 * Import third-party libraries
 */

import { distinctUntilChanged } from 'rxjs';

/**
 * Import third-party types
 */

import { Observable } from 'rxjs';

/**
 * angular-redux2
 */

import { DecoratorFlagComponent } from '../components/decorator-flag.component';

/**
 * angular-redux2 types
 */

import { Transformer } from '../interfaces/store.interface';
import { Comparator, Selector } from '../interfaces/store.interface';

/**
 * Selects an observable from the store, and attaches it to the decorated property.
 *
 * ```ts
 *  import { select } from '@angular-redux3/store';
 *
 *  class SomeClass {
 *      @Select(['foo','bar']) foo$: Observable<string>
 * }
 * ```
 *
 * @param {Selector<any, T>} selector -
 * A selector function, property name string, or property name path
 * (array of strings/array indices) that locates the store data to be
 * selected
 *
 * @param {Comparator} comparator - Function used to determine if this selector has changed.
 */

export function Select<T>(selector?: Selector<any, T>, comparator?: Comparator): PropertyDecorator {
    return (target: any, name: string | symbol): void => {
        if (!selector) {
            // remove $ from the name.
            selector = String(name).replace(/\$\s*$/, '');
        }

        return createSelectDecorator(selector, comparator)(target, name);
    };
}

export const select = Select;

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
 * import { select$ } from '@angular-redux3/store';
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
 * @param {Selector<any, T>} selector -
 * A selector function, property name string, or property name path
 * (array of strings/array indices) that locates the store data to be
 * selected
 *
 * @param {Transformer<any, T>} transformer - transformer that operates on observables instead of values.
 * @param {Comparator} comparator - Function used to determine if this selector has changed.
 */

export function Select$<T>(
    selector: Selector<any, T>,
    transformer: Transformer<any, T>,
    comparator?: Comparator
): PropertyDecorator {
    return createSelectDecorator(selector, comparator, transformer);
}

/**
 * Selects an observable using the given path selector, and runs it through the
 * given transformer function. A transformer function takes the store
 * observable as an input and returns a derived observable from it.
 *
 * @param {Selector<any, any>} selector -
 * A selector function, property name string, or property name path
 * (array of strings/array indices) that locates the store data to be
 * selected
 *
 * @param {Comparator} comparator - Function used to determine if this selector has changed.
 * @param {Transformer<any, any>} transformer - transformer that operates on observables instead of values.
 * @hidden
 */

function createSelectDecorator(
    selector: Selector<any, any>,
    comparator?: Comparator,
    transformer?: Transformer<any, any>,
): PropertyDecorator {
    return function decorator(target: any, name: string | symbol): void {
        function getter(this: any) {
            return getInstanceSelection(this, name, selector, transformer, comparator);
        }

        delete target[name];

        Object.defineProperty(target, name, {
            get: getter,
            enumerable: true,
            configurable: true,
        });
    };
}

/**
 * Call store (root or substore) selects with a path.
 *
 * @param {*} decoratedInstance - decorator instance
 * @param {string | symbol} name - string | symbol are use in select decorator (foo$) @Select(['foo','bar']) `foo$`: Observable<string>.
 * @param {Selector<any, T>} selector - select path in decorator.
 * @param {Transformer<any, T>} transformer - transformer that operates on observables instead of values.
 * @param {Comparator} comparator - Function used to determine if this selector has changed.
 * @hidden
 */

function getInstanceSelection<T>(
    decoratedInstance: any,
    name: string | symbol,
    selector: Selector<any, T>,
    transformer?: Transformer<any, T>,
    comparator?: Comparator
): Observable<any> | undefined {
    const { store, selections } = new DecoratorFlagComponent(decoratedInstance);

    if (selections[name]) {
        return selections[name];
    }

    if (!store) {
        return undefined;
    }

    const selection$ = transformer
        ? store.select(selector).pipe(
            (obs$: any) => transformer(obs$, decoratedInstance),
            distinctUntilChanged(comparator)
        ) : store.select(selector, comparator);

    selections[name] = selection$;

    return selection$;
}
