/**
 * Services
 */

import { NgRedux } from '../services/ng-redux.service';

/**
 * Hold substore action key
 */

export const ACTION_KEY = '&_ACTION';

/**
 * Key hold substore settings.
 */

export const SUBSTORE_KEY = '&_SUBSTORE';

/**
 * Hold caching of select-observable instance.
 */

export const SELECTION_KEY = '&_SELECTION';

/**
 * hold substore localReducer in pre-class instance.
 */

export const LOCAL_REDUCER_KEY = '&_SUBSTORE_LOCAL_REDUCER';

/**
 * Struct of SUBSTORE_KEY
 */

export type SubstoreFlag = {
    instance: NgRedux<any>;
    cachePath: string;
}
