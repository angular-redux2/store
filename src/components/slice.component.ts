/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Reducer, UnknownAction } from 'redux';
import type { ActionCreatorType } from '@interfaces/store.interface';
import type { CaseReducersType, SliceActionsType, SliceInterface } from '@interfaces/slice.interface';

/**
 * Imports
 */

import { draft } from '@components/draft.component';

/**
 * Creates an action creator for one action type.
 *
 * @typeParam Payload - The type of the payload, or `void` for an action without one
 * @param type - The action type
 * @returns A function that builds the action
 *
 * @remarks
 * The creator attaches the payload whenever it receives one,
 * including a falsy value such as `0`, `false`, or `''`.
 * Reach for it for an action that several reducers handle, or that no slice owns.
 *
 * @example
 * ```ts
 * const add = createAction<number>('ADD');
 * const reset = createAction('RESET');
 *
 * add(2);  // { type: 'ADD', payload: 2 }
 * reset(); // { type: 'RESET' }
 * ```
 *
 * @see createSlice
 *
 * @since 6.0.0
 */

export function createAction<Payload = void>(type: string): ActionCreatorType<Payload> {
    return <ActionCreatorType<Payload>> ((payload?: unknown) => payload === undefined ? { type } : { type, payload });
}

/**
 * Creates a reducer and its action creators from one handler per action.
 *
 * @typeParam State - The type of the state that the reducer owns
 * @typeParam Handlers - The handlers, inferred from the argument
 * @param name - The name of the slice, which prefixes every action type as `name/handler`
 * @param initialState - The state that the reducer starts from
 * @param handlers - One handler per action, which mutates a draft of the state or returns a new one
 * @returns The name, the reducer, and one typed action creator per handler
 *
 * @remarks
 * Each handler becomes its own draft reducer, stored by its full action type,
 * so the reducer finds the handler of an action with one lookup.
 * Only a matching action pays for the draft, and every other action returns the state unchanged.
 * A handler that changes nothing leaves the state as it was.
 *
 * @example
 * ```ts
 * const todos = createSlice('todos', <Array<TodoInterface>> [], {
 *     add(state, title: string) { state.push({ title, done: false }); },
 *     toggle(state, index: number) { state[index].done = !state[index].done; }
 * });
 *
 * const rootReducer = combineReducers({ todos: todos.reducer });
 * ngRedux.dispatch(todos.actions.add('Write docs')); // { type: 'todos/add', payload: 'Write docs' }
 * ```
 *
 * @see draft
 * @see createAction
 *
 * @since 6.0.0
 */

export function createSlice<State, Handlers extends CaseReducersType<State>>(
    name: string,
    initialState: State,
    handlers: Handlers
): SliceInterface<State, Handlers> {
    const actions: Record<string, unknown> = {};
    const reducers = new Map<string, Reducer<State>>();

    for (const [ key, handler ] of Object.entries(handlers)) {
        const type = `${ name }/${ key }`;
        actions[key] = createAction(type);
        reducers.set(type, draft(initialState, (state: State, action: UnknownAction) => handler(state, <never> action['payload'])));
    }

    return {
        name,
        actions: <SliceActionsType<Handlers>> actions,
        reducer: (state = initialState, action): State => {
            const reducer = reducers.get(action.type);

            return reducer ? reducer(state, action) : state;
        }
    };
}
