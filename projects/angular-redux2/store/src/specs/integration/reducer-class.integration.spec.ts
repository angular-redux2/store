/**
 * angular-redux2
 */

import { Action } from '../../decorators/action.decorator';
import { AbstractReducer } from '../../abstract/reducer.abstract';

/**
 * angular-redux2 types
 */

import { ReducerActions } from '../../interfaces/store.interface';

export interface Payload {
    name: string;
    isLogin?: boolean;
}

class UserReducer extends AbstractReducer {

    /**
     * Action payload types
     */

    static override actions: ReducerActions<UserReducer>;

    @Action
    isLogin(state: any, payload: Payload) {
        return payload;
    }
}

class AuthReducer extends AbstractReducer {

    /**
     * Action payload types
     */

    static override actions: ReducerActions<AuthReducer>;

    @Action
    isLogin(state: any, payload: Payload) {
        return payload;
    }
}

/**
 * Initialize global test mocks
 */

const userIsLoginSpy = jest.spyOn(UserReducer.prototype, 'isLogin');
const authIsLoginSpy = jest.spyOn(AuthReducer.prototype, 'isLogin');

beforeEach(() => {
    jest.resetAllMocks();
});

test('Should dispatch action by reducer class method.', () => {
    const reducer = AuthReducer.createReducer({});
    reducer({}, AuthReducer.actions.isLogin({
        name: 'test2'
    }));

    expect(authIsLoginSpy).toBeCalledWith({}, {
        name: 'test2'
    });
});

test('Should reducer class ignore different namespace dispatch.', () => {
    const reducer = UserReducer.createReducer({});
    reducer({}, AuthReducer.actions.isLogin({
        name: 'test2'
    }));

    expect(authIsLoginSpy).not.toBeCalled();
    expect(userIsLoginSpy).not.toBeCalled();
});
