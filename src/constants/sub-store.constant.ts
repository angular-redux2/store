/**
 * The action key that carries the route of a substore action.
 *
 * @remarks
 * A substore adds its route under this key to every action that it dispatches,
 * and the root reducer reads it to run the substore reducer on the right branch.
 *
 * @example
 * ```ts
 * bob.dispatch({ type: 'ADD_LOC' }); // the root store receives { type: 'ADD_LOC', [SUBSTORE_ROUTE]: { id: 0, path } }
 * ```
 *
 * @since 6.0.0
 */

export const SUBSTORE_ROUTE = '@angular-redux2/substore';
