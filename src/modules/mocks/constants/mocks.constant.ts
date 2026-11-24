/**
 * The action type that {@link MockNgRedux} dispatches to its own Redux store when a test sets the state.
 *
 * @remarks
 * The mock reducer answers only this action, so nothing that the code under test dispatches can change the state.
 *
 * @example
 * ```ts
 * store.setState({ counter: 3 }); // dispatches { type: SET_STATE, state: { counter: 3 } } internally
 * ```
 *
 * @since 6.0.0
 */

export const SET_STATE = '@@angular-redux2/mocks/SET_STATE';
