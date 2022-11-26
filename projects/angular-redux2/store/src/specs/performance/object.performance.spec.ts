/**
 * Test components
 */

import { performanceTest } from "../components/performance.jest";

/**
 * Components
 */

import { get, set } from "../../components/object.component";

/**
 * Initialize global test invariant variable
 */

const storeStruct = {
    foo: 1,
    a: false,
    b: 0,
    c: '',
    d: undefined,
    level_1: {
        a: false,
        b: 0,
        c: '',
        d: undefined,
        bar: 2,
        level_2: {
            fooBar: 3,
            level_3: {
                key: 'x',
            }
        },
    }
}

/**
 * Run performance test
 */

describe.only('Run performance test for object Getter && Setter', () => {
    test.only('should run 1M get request under a 0.4 second', () => {
        const result = performanceTest(() => {
            get(storeStruct, [ 'level_1', 'level_2', 'level_3', 'key' ]);
        }, 1000000);

        console.log(`run time of 1M get request ${ result }ms`);
        expect(result).toBeLessThan(400);
    });

    test.only('should run 1M set request under a 2 second', () => {
        const result = performanceTest(() => {
            set(storeStruct, [ 'level_1', 'level_2', 'level_3', 'key' ], 5);
        }, 1000000);

        console.log(`run time of 1M set request ${ result }ms`);
        expect(result).toBeLessThan(2000);
    });
});
