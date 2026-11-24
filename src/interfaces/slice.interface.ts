/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Reducer } from 'redux';
import type { ActionCreatorType } from '@interfaces/store.interface';

/**
 * The handlers that {@link createSlice} turns into a reducer, one per action.
 *
 * @typeParam State - The type of the state that the handlers receive
 *
 * @remarks
 * A handler receives a draft of the state and the action payload, and it mutates the draft or returns a new state.
 * The type of its second parameter becomes the payload type of its action creator,
 * and a handler without a second parameter gets a creator that takes no argument.
 *
 * @example
 * ```ts
 * const handlers = {
 *     add(state: Array<TodoInterface>, title: string) { state.push({ title, done: false }); },
 *     clear() { return []; }
 * };
 * ```
 *
 * @see createSlice
 *
 * @since 6.0.0
 */

export type CaseReducersType<State> = Record<string, (state: State, payload: never) => State | void>;

/**
 * One typed action creator per handler, by the handler name.
 *
 * @typeParam Handlers - The handlers that the creators belong to
 *
 * @remarks
 * The payload type comes from the second parameter of each handler.
 * A handler without one maps to `undefined`, which {@link ActionCreatorType} turns into a creator without an argument.
 *
 * @example
 * ```ts
 * type TodoActions = SliceActionsType<typeof handlers>;
 * // { add: (payload: string) => PayloadActionInterface<string>, clear: () => Action<string> }
 * ```
 *
 * @see CaseReducersType
 *
 * @since 6.0.0
 */

export type SliceActionsType<Handlers> = {
    [Key in keyof Handlers]: Handlers[Key] extends (...args: Array<never>) => unknown
        ? ActionCreatorType<Parameters<Handlers[Key]>[1]>
        : never;
};

/**
 * The name, reducer, and action creators that {@link createSlice} returns.
 *
 * @typeParam State - The type of the state that the reducer owns
 * @typeParam Handlers - The handlers that the slice was created from
 *
 * @remarks
 * Combine `reducer` into the root reducer, or pass the whole slice to `provideNgReduxFeature`,
 * which reads the key from `name`.
 * Dispatch the actions that `actions` builds.
 *
 * @example
 * ```ts
 * const todos = createSlice('todos', <Array<TodoInterface>> [], handlers);
 *
 * combineReducers({ todos: todos.reducer });
 * ngRedux.dispatch(todos.actions.add('Write docs'));
 * ```
 *
 * @see createSlice
 *
 * @since 6.0.0
 */

export interface SliceInterface<State, Handlers> {
    /**
     * The name of the slice, which prefixes every action type.
     *
     * @example
     * ```ts
     * todos.name; // 'todos'
     * ```
     *
     * @since 6.0.0
     */

    name: string;

    /**
     * The reducer that runs the handler of each action of the slice.
     *
     * @remarks
     * Any other action returns the state unchanged, without creating a draft.
     *
     * @example
     * ```ts
     * combineReducers({ todos: todos.reducer });
     * ```
     *
     * @since 6.0.0
     */

    reducer: Reducer<State>;

    /**
     * One typed action creator per handler, by the handler name.
     *
     * @example
     * ```ts
     * todos.actions.add('Write docs'); // { type: 'todos/add', payload: 'Write docs' }
     * todos.actions.clear();           // { type: 'todos/clear' }
     * ```
     *
     * @since 6.0.0
     */

    actions: SliceActionsType<Handlers>;
}
