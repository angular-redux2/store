# Class reducers

A class reducer maps action types to methods with `@Action(type)`, and `createReducerFromClass` turns the class into a
reducer.

```ts
import { Action, createReducerFromClass } from '@angular-redux2/store';

import type { AnyAction } from 'redux';

export const IS_LOGIN = 'IS_LOGIN';

export interface AuthInterface {
    isLoggedIn: boolean;
}

class AuthReducer {
    @Action(IS_LOGIN)
    isLogin(state: AuthInterface, action: AnyAction): AuthInterface {
        return { isLoggedIn: !state.isLoggedIn };
    }
}

export const authReducer = createReducerFromClass(AuthReducer, { isLoggedIn: false });
```

A method receives the state and the whole action, and returns the new state; the state is not a draft, so return a
copy rather than mutating it. An action no method is mapped to leaves the state as it was.

## See also

- [@Dispatch](/decorators/dispatch)
- [NgRedux](/store/ng-redux)
