/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { UnknownAction, Reducer } from 'redux';
import type { SubstoreRouteType } from '../interfaces/fractal.interface';
import type { MiddlewareInterface, NextMiddlewareInterface } from '../interfaces/reducer.interface';

/**
 * Imports
 */

import { ACTION_KEY } from '../interfaces/fractal.interface';
import { get, set, shallowCopy } from '../components/object.component';

/**
 * Tells whether a value is drafted, that is wrapped in a proxy that records writes.
 *
 * @param value - The value read from the draft
 * @returns `true` for arrays and plain objects
 *
 * @remarks
 * Only plain objects and arrays are drafted. `null`, `Date`, `Map`, `Set`, and class instances are handed to the
 * reducer as they are: a proxy around them breaks their methods, and `null` cannot be proxied at all.
 *
 * @since 6.0.0
 */

function isDraftable(value: unknown): boolean {
    if (Array.isArray(value)) {
        return true;
    }

    if (value === null || typeof value !== 'object') {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
}

/**
 * A draft object or array as the draft proxy sees it: any property key, any value.
 *
 * @since 6.0.0
 */

type DraftRecordType = Record<PropertyKey, unknown>;

/**
 * The key under which a draft proxy hands out its node.
 *
 * @since 6.0.0
 */

const DRAFT_NODE = Symbol('draft');

/**
 * One drafted object or array: the original, the copy the reducer writes to, and its place in the draft tree.
 *
 * @since 6.0.0
 */

interface DraftNodeInterface {
    /**
     * The original object, which is never written to.
     *
     * @since 6.0.0
     */

    base: DraftRecordType;

    /**
     * The shallow copy behind the proxy, which receives every write.
     *
     * @since 6.0.0
     */

    copy: DraftRecordType;

    /**
     * The proxy handed to the reducer.
     *
     * @since 6.0.0
     */

    proxy: DraftRecordType;

    /**
     * Whether this object or anything below it was written to.
     *
     * @since 6.0.0
     */

    modified: boolean;

    /**
     * The node of the object that holds this one.
     *
     * @since 6.0.0
     */

    parent?: DraftNodeInterface;

    /**
     * The drafts of the original children read so far, by key.
     *
     * @since 6.0.0
     */

    children: Map<PropertyKey, DraftNodeInterface>;
}

/**
 * Reads the draft node behind a value, if the value is a draft proxy.
 *
 * @param value - Any value
 * @returns The node, or `undefined` for anything that is not a draft
 *
 * @since 6.0.0
 */

function draftNodeOf(value: unknown): DraftNodeInterface | undefined {
    return isDraftable(value) ? <DraftNodeInterface | undefined> (<DraftRecordType> value)[DRAFT_NODE] : undefined;
}

/**
 * Marks a node and every node above it as modified.
 *
 * @param node - The node that was written to
 *
 * @since 6.0.0
 */

function markModified(node: DraftNodeInterface | undefined): void {
    while (node && !node.modified) {
        node.modified = true;
        node = node.parent;
    }
}

/**
 * Wraps an object or array in a draft.
 *
 * @param base - The original object
 * @param parent - The node of the object that holds it
 * @returns The new draft node
 *
 * @remarks
 * A child is drafted the first time it is read, and only while it still holds the original value, so a value the
 * reducer assigned itself is returned as it is.
 *
 * @since 6.0.0
 */

function createDraft(base: DraftRecordType, parent?: DraftNodeInterface): DraftNodeInterface {
    const node = <DraftNodeInterface> { base, parent, modified: false, copy: shallowCopy(base), children: new Map() };

    node.proxy = new Proxy(node.copy, {
        get(target: DraftRecordType, prop: PropertyKey, receiver: unknown): unknown {
            if (prop === DRAFT_NODE) {
                return node;
            }

            const child = node.children.get(prop);
            if (child) {
                return child.proxy;
            }

            const value: unknown = Reflect.get(target, prop, receiver);
            if (Object.prototype.hasOwnProperty.call(target, prop) && value === base[prop] && isDraftable(value)) {
                const draft = createDraft(<DraftRecordType> value, node);
                node.children.set(prop, draft);

                return draft.proxy;
            }

            return value;
        },
        set(target: DraftRecordType, prop: PropertyKey, value: unknown): boolean {
            if (node.children.get(prop)?.proxy !== value) {
                node.children.delete(prop);
            }

            target[prop] = value;
            markModified(node);

            return true;
        },
        deleteProperty(target: DraftRecordType, prop: PropertyKey): boolean {
            node.children.delete(prop);
            delete target[prop];
            markModified(node);

            return true;
        }
    });

    return node;
}

/**
 * Turns a draft, or a value that may hold drafts, back into plain state.
 *
 * @param value - The draft or value to resolve
 * @param seen - The objects already resolved, which guards against cycles
 * @returns The original object for an unmodified draft, the finished copy for a modified one, and the value
 * itself, with any drafts inside it resolved, for anything else
 *
 * @remarks
 * Writes only ever reach copies, so an original object never holds a draft. A modified copy is therefore only
 * scanned at the keys whose value changed or was drafted, and untouched branches are not walked.
 *
 * @since 6.0.0
 */

function finalize(value: unknown, seen: Set<unknown>): unknown {
    const node = draftNodeOf(value);
    if (node) {
        if (!node.modified) {
            return node.base;
        }

        for (const key of Object.keys(node.copy)) {
            const current = node.copy[key];
            const child = node.children.get(key);

            if (child && current === child.base) {
                node.copy[key] = finalize(child.proxy, seen);
            } else if (current !== node.base[key] && isDraftable(current)) {
                node.copy[key] = finalize(current, seen);
            }
        }

        return node.copy;
    }

    return isDraftable(value) ? resolveDrafts(<DraftRecordType> value, seen) : value;
}

/**
 * Replaces any drafts held directly or deeper inside a plain object or array with their final values.
 *
 * @param record - The object to scan, which is changed in place
 * @param seen - The objects already resolved
 * @returns The same object
 *
 * @since 6.0.0
 */

function resolveDrafts(record: DraftRecordType, seen: Set<unknown>): DraftRecordType {
    if (seen.has(record)) {
        return record;
    }

    seen.add(record);
    for (const key of Object.keys(record)) {
        const value = record[key];
        if (isDraftable(value)) {
            const resolved = finalize(value, seen);
            if (resolved !== value) {
                record[key] = resolved;
            }
        }
    }

    return record;
}

/**
 * The singleton that composes the root reducer and routes substore actions to their local reducers.
 *
 * @remarks
 * {@link NgRedux} wraps its root reducer here, and every {@link SubStoreService} registers its local reducer here.
 * The composed reducer runs the middlewares first, then the substore router, and the root reducer last.
 * Every reducer runs against a proxy draft of the state,
 * so a reducer may either return a new state or mutate the draft and return nothing.
 * Application code rarely calls it directly.
 *
 * @example
 * ```ts
 * class AuthReducer extends AbstractReducer {
 *     @Action
 *     login(state: Auth): void {
 *         state.isLoggedIn = true; // mutating the draft is enough
 *     }
 *
 *     @Action
 *     logout(state: Auth): Auth {
 *         return { ...state, isLoggedIn: false }; // returning a new state also works
 *     }
 * }
 * ```
 *
 * @see NgRedux.configureStore
 * @see SubStoreService
 *
 * @since 5.0.0
 */

export class ReducerService {
    /**
     * The shared instance that {@link ReducerService.getInstance} returns.
     *
     * @hidden
     * @since 5.0.0
     */

    private static instance: ReducerService;

    /**
     * The root reducer that runs last in the composed chain.
     *
     * @remarks
     * {@link ReducerService.composeReducers} sets it, and {@link ReducerService.replaceReducer} swaps it.
     * The composed reducer reads it on every action, so a replacement applies from the next action on.
     *
     * @since 5.0.0
     */

    private rootReducer: Reducer;

    /**
     * The feature reducers of the store, by the top-level key that each one owns.
     *
     * @remarks
     * {@link ReducerService.composeReducers} receives the map from the store and keeps a reference,
     * so a feature that the store adds later takes part from the next action on.
     *
     * @since 6.0.0
     */

    private featureReducers: ReadonlyMap<string, Reducer> = new Map();

    /**
     * The registry of local reducers, keyed by the hash of their source text.
     *
     * @remarks
     * The substore router looks up the hash that a substore action carries under {@link ACTION_KEY}.
     *
     * @since 5.0.0
     */

    private readonly mapSubReducers: {
        [id: string]: Reducer
    } = {};

    /**
     * Returns the shared instance, creating it on the first call.
     *
     * @returns The shared reducer service
     *
     * @remarks
     * The instance lives for the whole process, so its registry outlives any single store.
     *
     * @example
     * ```ts
     * ReducerService.getInstance() === ReducerService.getInstance(); // true
     * ```
     *
     * @since 5.0.0
     */

    static getInstance(): ReducerService {
        return ReducerService.instance ??= new ReducerService();
    }

    /**
     * Wraps a root reducer with middlewares and substore routing.
     *
     * @param rootReducer - The root reducer to run last
     * @param middlewares - The middlewares to run first, in order
     * @param featureReducers - The reducers that own one top-level key each, next to the root reducer
     * @returns The composed reducer to hand to Redux
     *
     * @remarks
     * The chain is the middlewares, then the substore router, then the root reducer through a proxy draft.
     * A substore action that changes its branch stops at the router, so the root reducer does not see it.
     * Calling it again replaces the stored root reducer for every reducer that this service composed.
     *
     * The root reducer never sees the keys of the feature reducers, so `combineReducers` keeps them and does not warn.
     * Each feature reducer receives a draft of its own key, and a feature key wins over the same key of the root.
     *
     * @example
     * ```ts
     * const reducer = ReducerService.getInstance().composeReducers(rootReducer, [ logger ]);
     * const store = createStore(reducer, INITIAL_STATE);
     * ```
     *
     * @see MiddlewareInterface
     *
     * @since 5.0.0
     */

    composeReducers<State>(
        rootReducer: Reducer,
        middlewares: Array<MiddlewareInterface<State>> = [],
        featureReducers: ReadonlyMap<string, Reducer> = new Map()
    ): Reducer {
        this.rootReducer = rootReducer;
        this.featureReducers = featureReducers;

        const middlewareList: Array<MiddlewareInterface> = [
            ...<Array<MiddlewareInterface>> <unknown> middlewares,
            this.subStoreRootReducer.bind(this),
            (state, action): unknown => this.reduceRoot(state, action)
        ];

        return (state: unknown, action: UnknownAction): unknown => this.executeMiddlewareChain(state, action, middlewareList);
    }

    /**
     * Replaces the root reducer at the end of the composed chain.
     *
     * @param nextReducer - The root reducer to use from the next action on
     *
     * @remarks
     * The middlewares and the substore routing stay in place.
     *
     * @example
     * ```ts
     * ReducerService.getInstance().replaceReducer(nextRootReducer);
     * ```
     *
     * @since 5.0.0
     */

    replaceReducer(nextReducer: Reducer): void {
        this.rootReducer = nextReducer;
    }

    /**
     * Returns a 32-bit hash of a string.
     *
     * @param string - The text to hash
     * @returns The hash as a signed 32-bit integer
     *
     * @remarks
     * It multiplies by 31 and adds each character code, walking the string from last to first,
     * and truncates to 32 bits after every step.
     * Substores hash the source text of their local reducer,
     * so two reducers with identical source get the same hash.
     *
     * @example
     * ```ts
     * const service = ReducerService.getInstance();
     *
     * service.hashSignature('abc') === service.hashSignature('abc'); // true
     * service.hashSignature('');                                    // 0
     * ```
     *
     * @since 5.0.0
     */

    hashSignature(string: string): number {
        let hash = 0;
        let index = string.length;

        while (index > 0) {
            hash = (hash << 5) - hash + string.charCodeAt(--index) | 0;
        }

        return hash;
    }

    /**
     * Registers a local reducer under a hash, unless the hash is already taken.
     *
     * @param hashReducer - The hash that substore actions carry
     * @param localReducer - The local reducer to register
     *
     * @remarks
     * The first reducer registered under a hash stays, and later registrations under that hash are ignored.
     * Use {@link ReducerService.replaceSubReducer} to change it.
     *
     * @example
     * ```ts
     * service.registerSubReducer(hash, userReducer);
     * service.registerSubReducer(hash, otherReducer); // ignored, userReducer stays
     * ```
     *
     * @since 5.0.0
     */

    registerSubReducer(
        hashReducer: number,
        localReducer: Reducer
    ): void {
        this.mapSubReducers[hashReducer] ??= localReducer;
    }

    /**
     * Replaces the local reducer registered under a hash.
     *
     * @param hashReducer - The hash of the registered reducer
     * @param nextLocalReducer - The reducer to use from the next action on
     *
     * @remarks
     * A hash without a registered reducer is ignored, so this method never adds a new entry.
     *
     * @example
     * ```ts
     * service.replaceSubReducer(hash, nextUserReducer);
     * ```
     *
     * @since 5.0.0
     */

    replaceSubReducer(
        hashReducer: number,
        nextLocalReducer: Reducer
    ): void {
        if (this.mapSubReducers[hashReducer]) {
            this.mapSubReducers[hashReducer] = nextLocalReducer;
        }
    }

    /**
     * Routes a substore action to its local reducer, or passes the action on.
     *
     * @param state - The root state
     * @param action - The action being reduced
     * @param next - The rest of the chain
     * @returns The root state with the updated branch, or the result of `next`
     *
     * @remarks
     * For an action with {@link ACTION_KEY}, it runs the registered local reducer against the branch at the path.
     * When the branch changes, it writes the new branch into a copy of the root state and stops the chain there.
     * An unchanged branch, an unknown hash, or an action without the key falls through to `next`.
     *
     * @since 5.0.0
     */

    private subStoreRootReducer(state: unknown, action: UnknownAction, next: NextMiddlewareInterface): unknown {
        const route = <SubstoreRouteType | undefined> action[ACTION_KEY];
        const localReducer = route && this.mapSubReducers[route.hash];

        if (route?.path && localReducer) {
            const fractalState = get(state, route.path);
            const newState = this.produce(fractalState, action, localReducer);

            if (newState !== fractalState) {
                return set(state, route.path, newState);
            }
        }

        return next(state, action);
    }

    /**
     * Runs a list of middlewares as a chain for one action.
     *
     * @param state - The state to start with
     * @param action - The action being reduced
     * @param middlewareList - The middlewares to run, in order
     * @returns The state that the chain produced
     *
     * @remarks
     * Each middleware receives a `next` that runs the following one.
     * A `next` call without an action passes on the original action.
     * When the list runs out, `next` returns the state that it received.
     *
     * @since 5.0.0
     */

    private executeMiddlewareChain(state: unknown, action: UnknownAction, middlewareList: Array<MiddlewareInterface>): unknown {
        let index = 0;

        function next(newState: unknown, newAction: UnknownAction = action): unknown {
            const middleware = middlewareList[index++];

            return middleware ? middleware(newState, newAction, next) : newState;
        }

        return next(state, action);
    }

    /**
     * Runs the root reducer and every feature reducer, each against a draft of its own part of the state.
     *
     * @param state - The current root state
     * @param action - The action being reduced
     * @returns The next root state: the same object when no reducer changed anything
     *
     * @remarks
     * Without feature reducers, the root reducer gets the whole state.
     * Otherwise it gets a shallow copy without the feature keys,
     * and each feature reducer gets the value under its key.
     * The parts are merged into a new root object only when one of them changed.
     *
     * @since 6.0.0
     */

    private reduceRoot(state: unknown, action: UnknownAction): unknown {
        if (this.featureReducers.size === 0) {
            return this.produce(state, action, this.rootReducer);
        }

        const record = <Record<string, unknown> | undefined> state;
        const rootState = record && Object.fromEntries(Object.entries(record).filter(([ key ]) => !this.featureReducers.has(key)));
        const nextRoot = this.produce(rootState, action, this.rootReducer);
        const features: Record<string, unknown> = {};
        let changed = nextRoot !== rootState;

        for (const [ key, reducer ] of this.featureReducers) {
            const previous = record?.[key];
            features[key] = this.produce(previous, action, reducer);
            changed ||= features[key] !== previous;
        }

        return changed ? { ...<object> nextRoot, ...features } : state;
    }

    /**
     * Runs a reducer against a draft of the state and returns the next state.
     *
     * @param state - The current state, which is never modified
     * @param action - The action being reduced
     * @param reducer - The reducer to run
     * @returns The next state: the same object when the reducer changed nothing
     *
     * @remarks
     * The reducer receives a draft it may mutate. Every object it reaches is a copy, so the writes never touch
     * `state`. Only the objects on the path to a write are new in the result; untouched branches keep their
     * identity. A value the reducer returns is used instead of the draft, with any drafts inside it resolved.
     * Values that are not plain objects or arrays are passed through as they are.
     *
     * @since 5.0.0
     */

    private produce(state: unknown, action: UnknownAction, reducer: Reducer): unknown {
        if (!isDraftable(state)) {
            return reducer(state, action);
        }

        const root = createDraft(<DraftRecordType> state);
        const result: unknown = reducer(root.proxy, action);

        return finalize(result === undefined ? root.proxy : result, new Set());
    }

}
