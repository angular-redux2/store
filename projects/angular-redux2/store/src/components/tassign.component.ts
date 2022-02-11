/**
 * Deep copy - copy nested object into the new object,
 * `it is recursive try to minimize using it.`
 *
 * ```typescript
 *  const oldObject = {...object};
 *  const newObject = deepCopy(oldObject);
 * ```
 *
 * @param objectData - object to copy to new one.s
 */

export function deepCopy<T>(objectData: any): T {
    let outObject: any, value, key;

    if (typeof objectData !== 'object' || objectData === null) {
        return objectData; // Return the value if inObject is not an object
    }

    // Create an array or object to hold the values
    outObject = Array.isArray(objectData) ? [] : {};

    for (key in objectData) {
        value = objectData[key];

        // Recursively (deep) copy for nested objects, including arrays
        outObject[key] = deepCopy(value);
    }

    return outObject;
}
