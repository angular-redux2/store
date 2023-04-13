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

