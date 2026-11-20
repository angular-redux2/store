/**
 * angular-redux2
 */

import { resolver } from '../../components/selectors.component';

test('Should get a string property from reducer calculate by object.get.', () => {
    const reducer = resolver([ 'level1', 'level2' ]);
    const state = {
        level1: {
            level2: 'test'
        }
    };

    expect(reducer(state)).toStrictEqual('test');
});

test('Should get undefined property from reducer calculate by object.get.', () => {
    const reducer = resolver([ 'level1', 'level3' ]);
    const state = {
        level1: {
            level2: 'test'
        }
    };

    expect(reducer(state)).toStrictEqual(undefined);
});
