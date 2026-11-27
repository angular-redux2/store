/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { PathType } from '../../interfaces/store.interface';

/**
 * The route that a substore adds to each action it dispatches.
 *
 * @remarks
 * The root reducer reads it to run the substore reducer on the branch at `path`.
 * It holds an id instead of the reducer itself,
 * so the action stays serializable and the Redux DevTools extension can record and replay it.
 *
 * @since 6.0.0
 */

export interface SubstoreRouteInterface {
    /**
     * The id of the substore reducer in the root store.
     *
     * @since 6.0.0
     */

    id: number;

    /**
     * The path of the branch at the moment of the dispatch.
     *
     * @since 6.0.0
     */

    path: PathType;
}
