/**
 * Abstracts
 */

import { AbstractReducer } from "../../abstract/reducer.abstract";

/**
 * Interfaces
 */

import { ReducerAction } from "../../interfaces/store.interface";

/**
 * Decorators
 */

import { Action } from "../../decorators/action.decorator";

/**
 * Initialize global test invariant variable
 */

interface Payload {
    name: string;
    isLogin?: boolean;
}

class UserReducer extends AbstractReducer {

    /**
     * Action payload types
     */

    static override actions: {
        isLogin: ReducerAction<Payload>
    }

    @Action
    isLogin(payload: Payload) {
        return payload;
    }
}

class AuthReducer extends AbstractReducer {

    /**
     * Action payload types
     */

    static override actions: {
        isLogin: ReducerAction<Payload>
    }

    @Action
    isLogin(payload: Payload) {
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
