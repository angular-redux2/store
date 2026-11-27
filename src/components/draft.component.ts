/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { Reducer, UnknownAction } from 'redux';
import type { DraftContextInterface, DraftNodeInterface, DraftRecordType } from './interfaces/draft-component.interface';

/**
 * Imports
 */

import { copy, isPlain } from './object.component';

/**
 * Wraps an object or array in a draft.
 *
 * @param base - The original object
 * @param context - The state of the current reducer call, which receives the new node
 * @returns The proxy that the recipe reads and writes
 *
 * @remarks
 * The proxy drafts a child the first time the recipe reads it and stores that draft in the copy,
 * so every later read returns the same draft.
 * A value that the recipe assigned itself comes back as it is.
 * The proxy ignores an assignment of the value that a key already holds, so that assignment copies nothing.
 *
 * @example
 * ```ts
 * const context: DraftContextInterface = { nodes: new Map(), results: new Map(), search: true };
 * const proxy = createDraft({ count: 0, list: [ 1 ] }, context);
 *
 * proxy.count = 1; // the copy holds 1, and the base still holds 0
 * proxy.count = 1; // ignored - the copy already holds 1
 * proxy.list;      // a draft of [ 1 ], created on this first read
 * ```
 *
 * @since 6.0.0
 */

export function createDraft(base: DraftRecordType, context: DraftContextInterface): DraftRecordType {
    const node: DraftNodeInterface = { base, copy: copy(base), keys: new Set(), modified: false };
    const proxy = new Proxy(node.copy, {
        get(target, key): unknown {
            const value = target[key];
            if (value !== base[key] || !isPlain(value) || !Object.hasOwn(target, key)) return value;

            node.keys.add(key);

            return target[key] = createDraft(value, context);
        },
        set(target, key, value): boolean {
            if (!Object.hasOwn(target, key)) node.modified = true;
            else if (target[key] === value) return true;

            target[key] = value;
            node.keys.add(key);

            return true;
        },
        deleteProperty(target, key): boolean {
            if (Object.hasOwn(target, key)) node.modified = delete target[key];

            return true;
        }
    });

    context.nodes.set(proxy, node);

    return proxy;
}

/**
 * Turns a draft, or a new value that may hold drafts, into plain state.
 *
 * @param value - The draft or value to resolve
 * @param context - The state of the current reducer call
 * @returns The original object for an unchanged draft, the finished copy for a changed one,
 * and the value itself, with any drafts inside it resolved, for anything else
 *
 * @remarks
 * A draft is unchanged when the recipe added or deleted no key and every revisited key ends with its original value,
 * so an action that only reads, or that sets a value back to what it was, returns the original object.
 * It revisits only the keys that the recipe drafted or assigned, and it never walks an untouched branch.
 * It resolves a new plain value in place and writes a key only when its value changes,
 * so a frozen value, such as a constant initial state, passes through without an error.
 *
 * @example
 * ```ts
 * const context: DraftContextInterface = { nodes: new Map(), results: new Map(), search: true };
 * const base = { user: { name: 'Bob' }, tags: [ 'a' ] };
 * const proxy = createDraft(base, context);
 *
 * proxy.user.name = 'Robert';
 * const next = finalize(proxy, context);
 *
 * next;                    // { user: { name: 'Robert' }, tags: [ 'a' ] }
 * next === base;           // false - the root is a new object
 * next.tags === base.tags; // true - the untouched branch stays shared
 * ```
 *
 * @since 6.0.0
 */

export function finalize(value: unknown, context: DraftContextInterface): unknown {
    if (!isPlain(value)) return value;

    const { nodes, results } = context;
    if (results.has(value)) return results.get(value);

    const node = nodes.get(value);
    if (!node) {
        if (!context.search) return value;

        results.set(value, value);
        for (const key of Object.keys(value)) {
            const next = finalize(value[key], context);
            if (next !== value[key]) value[key] = next;
        }

        return value;
    }

    const { base, copy: draftCopy, keys } = node;
    results.set(value, draftCopy);

    let modified = node.modified;
    for (const key of keys) {
        if (!Object.hasOwn(draftCopy, key)) continue;

        const next = draftCopy[key] = finalize(draftCopy[key], context);
        modified ||= next !== base[key];
    }

    const result = modified ? draftCopy : base;
    results.set(value, result);

    return result;
}

/**
 * Wraps a reducer so it receives a draft of the state that it may mutate.
 *
 * @typeParam State - The type of the state that the reducer owns
 * @typeParam Action - The type of the actions that the reducer handles
 * @param initialState - The state that the reducer starts from when it receives `undefined`
 * @param recipe - The reducer, which mutates its draft or returns a new state
 * @returns A plain Redux reducer that never changes the state it receives
 *
 * @remarks
 * Plain reducers must return a new state for every change, as in Redux.
 * Wrap a reducer, or one branch of the root reducer, in `draft` to write the change as a mutation instead.
 * Only the objects on the path to a changed value are new in the result,
 * and an action that changes nothing returns the same state object.
 * When the recipe returns a value, the reducer uses it instead of the draft and resolves any drafts inside it.
 * It drafts only plain objects and arrays, so `null`, a `Date`, a `Map`, or a class instance reaches the recipe as it is.
 * A primitive state goes to the recipe directly, and a recipe that returns nothing for it keeps the state.
 *
 * @example
 * ```ts
 * const todos = draft(<Array<TodoInterface>> [], (state, action) => {
 *     if (action.type === 'ADD') state.push({ title: <string> action.payload, done: false });
 * });
 *
 * const added = todos([], { type: 'ADD', payload: 'Write docs' }); // [ { title: 'Write docs', done: false } ]
 * todos(added, { type: 'RESET' }) === added;                        // true - the recipe changed nothing
 * ```
 *
 * @since 6.0.0
 */

export function draft<State, Action extends UnknownAction = UnknownAction>(
    initialState: State,
    recipe: (state: State, action: Action) => State | void
): Reducer<State, Action> {
    return (state: State = initialState, action: Action): State => {
        if (!isPlain(state)) {
            const result = recipe(state, action);

            return result === undefined ? state : result;
        }

        const context: DraftContextInterface = { nodes: new Map(), results: new Map(), search: true };
        const root = createDraft(state, context);
        const result = recipe(<State> root, action);

        // While the root is the only draft, a new value can hold a draft only if the recipe returned it.
        context.search = result !== undefined || context.nodes.size > 1;

        return <State> finalize(result === undefined ? root : result, context);
    };
}
