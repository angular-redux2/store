/**
 * angular-redux2 types
 */

import { AbstractStore } from '../abstract/store.abstract';

/**
 * Key used to store the action type in the Redux store's state tree.
 * This is used to track dispatched actions and perform time-travel debugging.
 * It is recommended that you do not modify or access this value directly.
 */

export const ACTION_KEY = '&_ACTION';

/**
 * The key used to store the local reducer function in a class constructor when using the `@SubStore` decorator.
 * The local reducer function is used to modify the behavior of the `@Select`, `@Select$`, and `@Dispatch` decorators
 * to operate on a substore defined by the decorated class.
 * @type {string}
 */

export const LOCAL_REDUCER_KEY = '&_SUBSTORE_LOCAL_REDUCER';

/**
 * Key to store the substore instance in the decorated class instance.
 * This key is used by the `WithSubStore` decorator to cache the substore instance created for the class instance.
 * @type {string}
 */

export const SUBSTORE_KEY = '&_SUBSTORE';

/**
 * Key to access the cached selection object of a decorated class instance.
 * The cached selection object contains the properties and methods that are decorated with the `@Select()` decorator.
 * The value of this constant is used as a property name in the instance object to store the selection object.
 * The actual value of the constant is not important as long as it is unique and not likely to conflict with other property names.
 * @type {string}
 */

export const SELECTION_KEY = '&_SELECTION';

/**
 * Represents a flag used to store information related to a substore.
 *
 * @typedef {Object} SubstoreFlag
 * @property {AbstractStore<any>} instance - The instance of the substore.
 * @property {string} cachePath - The path of the substore that is cached.
 */

export type SubstoreFlag = {
    instance: AbstractStore<any>;
    cachePath: string;
}

