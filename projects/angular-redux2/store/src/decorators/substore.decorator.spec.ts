/**
 * Decorator's
 */

import { Substore } from "./substore.decorator";

/**
 * Interfaces
 */

import { LOCAL_REDUCER_KEY } from "../interfaces/fractal.interface";

/**
 * Initialize global test invariant variable
 */

const reducer = (state: any, action: any) => {
    return state;
};

@Substore(reducer)
class Test {

}

test('Should create key in class that hold the local reducer function.', () => {
    expect((Test as any)[LOCAL_REDUCER_KEY]).toStrictEqual(reducer);
});
