/**
 * Test components
 */

import { performanceTest } from "../components/performance.jest";

/**
 * Services
 */

import { ReducerService } from "../../services/reducer.service";

/**
 * Run performance test
 */

fit('should run 1M hashSignature request under a 3 second', () => {
    const userComponentReducer = (state: any, action: any) => {
        if (action.type === 'ADD_LOC') {
            return { ...state, loc: state.loc + action.payload };
        }

        return state;
    }

    const result = performanceTest(() => {
        ReducerService.getInstance().hashSignature(userComponentReducer.toString());
    }, 1000000);

    console.log(`run time of 1M hashSignature request ${ result }ms`);
    expect(result).toBeLessThan(3000);
});
