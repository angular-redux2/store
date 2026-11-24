/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Action, UnknownAction } from 'redux';

/**
 * Imports
 */

import { NgRedux } from '@angular-redux2/store';
import { SET_STATE } from '@mocks/constants/mocks.constant';

/**
 * A stand-in for {@link NgRedux} whose state a test sets directly.
 *
 * @typeParam State - The type of the root state
 *
 * @remarks
 * The mock runs no reducer of the application.
 * {@link MockNgRedux.setState} and {@link MockNgRedux.patchState} write the state,
 * and every selection follows, including `injectSelect` and substores.
 * {@link MockNgRedux.dispatch} records the action in {@link MockNgRedux.dispatched} and leaves the state alone,
 * so a test checks what the code dispatched instead of what a reducer made of it.
 *
 * @example
 * ```ts
 * TestBed.configureTestingModule({ providers: [ provideMockNgRedux<AppState>({ counter: 0 }) ] });
 * const store = TestBed.inject(MockNgRedux<AppState>);
 *
 * store.patchState({ counter: 3 });
 * component.count();  // 3
 *
 * component.increment();
 * store.dispatched;   // [ { type: 'INCREMENT' } ]
 * ```
 *
 * @see provideMockNgRedux
 *
 * @since 6.0.0
 */

export class MockNgRedux<State = unknown> extends NgRedux<State> {
    /**
     * The actions dispatched since the mock was created or last reset, oldest first.
     *
     * @remarks
     * A substore dispatch shows up here too, with its route attached to the action.
     *
     * @example
     * ```ts
     * store.dispatch({ type: 'INCREMENT' });
     * store.dispatched; // [ { type: 'INCREMENT' } ]
     * ```
     *
     * @since 6.0.0
     */

    readonly dispatched: Array<UnknownAction> = [];

    /**
     * Creates the mock with an optional starting state.
     *
     * @param initialState - The state that the mock starts from, and returns to on {@link MockNgRedux.reset}
     *
     * @remarks
     * The mock is a real {@link NgRedux} with a reducer that only answers its own set-state action,
     * so selections, `select$`, and substores behave exactly as they do in the application.
     *
     * @since 6.0.0
     */

    constructor(private readonly initialState?: State) {
        super({
            initialState,
            reducer: (state, action) => <State> (action.type === SET_STATE ? action['state'] : state)
        });
    }

    /**
     * Records an action without reducing it.
     *
     * @typeParam DispatchedAction - The type of the action
     * @param action - The action that the code under test dispatches
     * @returns The same action
     *
     * @remarks
     * The state stays as the test set it, so a component under test cannot change it by dispatching.
     *
     * @example
     * ```ts
     * store.dispatch({ type: 'INCREMENT' }); // { type: 'INCREMENT' }
     * store.getState().counter;              // still 0
     * ```
     *
     * @since 6.0.0
     */

    override dispatch<DispatchedAction extends Action>(action: DispatchedAction): DispatchedAction {
        this.dispatched.push(<UnknownAction> <unknown> action);

        return action;
    }

    /**
     * Replaces the whole state.
     *
     * @param state - The new state
     *
     * @remarks
     * Every selection updates at once, and `select$` subscribers receive the change synchronously.
     *
     * @example
     * ```ts
     * store.setState({ counter: 5 });
     * store.getState(); // { counter: 5 }
     * ```
     *
     * @since 6.0.0
     */

    setState(state: State): void {
        super.dispatch({ type: SET_STATE, state });
    }

    /**
     * Merges part of the state into the current state.
     *
     * @param patch - The top-level keys to replace
     *
     * @example
     * ```ts
     * store.patchState({ counter: 3 });
     * store.getState(); // { counter: 3, todos: [] }
     * ```
     *
     * @since 6.0.0
     */

    patchState(patch: Partial<State>): void {
        this.setState({ ...this.getState(), ...patch });
    }

    /**
     * Clears the recorded actions and returns to the starting state.
     *
     * @remarks
     * Call it between tests when several tests share one mock.
     *
     * @example
     * ```ts
     * store.reset();
     * store.dispatched; // []
     * ```
     *
     * @since 6.0.0
     */

    reset(): void {
        this.dispatched.length = 0;
        this.setState(<State> this.initialState);
    }
}
