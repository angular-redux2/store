# ClassReducer

You can create a class reducer improve readability and maintenance.

```typescript
/**
 * Imports
 */

import { AnyAction } from "redux";
import { Action, createReducerFromClass } from "@angular-redux2/store";

/**
 * Update auth user data
 */

export const IS_LOGIN = 'IS_LOGIN';

/**
 * AuthState interface
 */

export interface Auth {
    isLoggedIn: boolean;
}

/**
 * Init Auth model
 */

export const AUTH_INITIAL_STATE: Auth = {
    isLoggedIn: false
};

/**
 * Class Reducer
 */

class Reducer {
    /**
     * Update login data
     */

    @Action(IS_LOGIN)
    isLogin(state: Auth, action: AnyAction) {
        return { isLoggedIn: !state.isLoggedIn };
    }
}

export const authReducer = createReducerFromClass(Reducer, AUTH_INITIAL_STATE);
```

Or old way

```typescript
/**
 * Imports
 */

import { AnyAction } from "redux";

/**
 * Update auth user data
 */

export const IS_LOGIN = 'IS_LOGIN';

/**
 * AuthState interface
 */

export interface Auth {
    isLoggedIn: boolean;
}

/**
 * Init Auth model
 */

export const AUTH_INITIAL_STATE: Auth = {
    isLoggedIn: false
};

/**
 * AuthReducer
 */

export function authReducer(state: Auth = AUTH_INITIAL_STATE, action: AnyAction): Auth {
    switch (action.type) {
        case IS_LOGIN:
            return { isLoggedIn: !state.isLoggedIn };
    }

    return state;
}
```