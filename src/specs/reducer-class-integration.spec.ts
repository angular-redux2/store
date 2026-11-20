/**
 * Type-only imports erased during TypeScript compilation.
 */

import type { ReducerActionsType } from '@interfaces/store.interface';

/**
 * Imports
 */

import { Action } from '@decorators/action.decorator';
import { AbstractReducer } from '@abstract/reducer.abstract';

export interface PayloadInterface {
    name: string;
    isLogin?: boolean;
}

class UserReducer extends AbstractReducer {

    /**
     * Action payload types
     */

    static override actions: ReducerActionsType<UserReducer>;

    @Action
    isLogin(state: any, payload: PayloadInterface) {
        return payload;
    }
}

class AuthReducer extends AbstractReducer {

    /**
     * Action payload types
     */

    static override actions: ReducerActionsType<AuthReducer>;

    @Action
    isLogin(state: any, payload: PayloadInterface) {
        return payload;
    }
}

/**
 * Initialize global test mocks
 */

const userIsLoginSpy = xJet.spyOn(UserReducer.prototype, 'isLogin');
const authIsLoginSpy = xJet.spyOn(AuthReducer.prototype, 'isLogin');

beforeEach(() => {
    xJet.resetAllMocks();
});

test('Should dispatch action by reducer class method.', () => {
    const reducer = AuthReducer.createReducer({});
    reducer({}, AuthReducer.actions.isLogin({
        name: 'test2'
    }));

    expect(authIsLoginSpy).toHaveBeenCalledWith({}, {
        name: 'test2'
    });
});

test('Should reducer class ignore different namespace dispatch.', () => {
    const reducer = UserReducer.createReducer({});
    reducer({}, AuthReducer.actions.isLogin({
        name: 'test2'
    }));

    expect(authIsLoginSpy).not.toHaveBeenCalled();
    expect(userIsLoginSpy).not.toHaveBeenCalled();
});
