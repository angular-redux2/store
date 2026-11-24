/**
 * Imports
 */

import { makeStateKey } from '@angular/core';

/**
 * The key under which server-side rendering hands the state to the browser.
 *
 * @remarks
 * `provideNgRedux` reads the state under this key in the browser and writes it on the server,
 * when the `transferState` option is on.
 *
 * @example
 * ```ts
 * inject(TransferState).get(STATE_KEY, undefined); // the state that the server rendered with
 * ```
 *
 * @since 6.0.0
 */

export const STATE_KEY = makeStateKey<unknown>('@angular-redux2/store');
