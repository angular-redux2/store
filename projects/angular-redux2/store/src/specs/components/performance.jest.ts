/**
 * Calculate run time in seconds of function.
 *
 * @param callback - the function to test.
 * @param rounds - number on iteration to test.
 */

export function performanceTest(callback: Function, rounds: number = 1000): number {
    const startTime = performance.now();

    for (let i = 0; i < rounds; i++) {
        callback();
    }

    const endTime = performance.now();

    return Math.round((endTime - startTime) * 1000) / 1000;
}
