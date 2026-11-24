/**
 * A drafted object or array as the proxy sees it: any property key, any value.
 *
 * @since 6.0.0
 */

export type DraftRecordType = Record<PropertyKey, unknown>;

/**
 * One drafted object or array: the original, the copy behind the proxy, and the keys that the recipe touched.
 *
 * @remarks
 * The copy holds the draft of a child in place of the original child once the recipe reads it,
 * so a second read returns the same draft without a lookup.
 * A node never points at its parent.
 * The draft finalizer decides whether a node changed by walking down from the root,
 * so an assignment does not have to mark every node above it.
 *
 * @since 6.0.0
 */

export interface DraftNodeInterface {
    /**
     * The original object, which the draft never changes.
     *
     * @since 6.0.0
     */

    base: DraftRecordType;

    /**
     * The shallow copy behind the proxy, which receives every assignment.
     *
     * @since 6.0.0
     */

    copy: DraftRecordType;

    /**
     * The keys whose value the recipe drafted or assigned.
     *
     * @remarks
     * The draft finalizer only revisits these keys,
     * so a push onto a long array resolves two keys instead of scanning the whole array.
     *
     * @since 6.0.0
     */

    keys: Set<PropertyKey>;

    /**
     * Whether the recipe added or deleted a key on this object.
     *
     * @remarks
     * A changed value on an existing key needs no flag,
     * because the draft finalizer compares every revisited key with the original.
     *
     * @since 6.0.0
     */

    modified: boolean;
}

/**
 * The state of one reducer call, shared by every draft that the call creates.
 *
 * @remarks
 * One object travels through the recursion instead of three separate arguments.
 *
 * @since 6.0.0
 */

export interface DraftContextInterface {
    /**
     * The draft nodes of the call, by proxy.
     *
     * @since 6.0.0
     */

    nodes: Map<unknown, DraftNodeInterface>;

    /**
     * The values already resolved, by the draft or value that produced them.
     *
     * @remarks
     * It guards against cycles and gives a draft assigned to two keys the same final object.
     *
     * @since 6.0.0
     */

    results: Map<unknown, unknown>;

    /**
     * Whether a new plain value may hold a draft and the finalizer has to search it.
     *
     * @remarks
     * It is `false` when the recipe returned nothing and read no child,
     * so an assignment such as `state.items = action.payload` does not walk the payload.
     *
     * @since 6.0.0
     */

    search: boolean;
}
