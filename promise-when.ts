import { settle, Settled } from './promise-settle';

/**
 * Only thrown by `when`.
 */
export class WhenError extends Error {
    public errors: any[];

    constructor(settled: Array<Settled<any>>) {
        super('All promises rejected');
        /** List of errors from rejected promises. */
        this.errors = settled.map(promise => promise.reason());
    }
}

/**
 * Returns a promise that is fulfilled when some items fulfill. Rejects if all items reject.
 *
 * Like Promise.all, except that it doesn't reject when a single promise rejects.
 * Instead, it ignores errors unless every single promise rejects.
 * If so, a `WhenError` is thrown with all the errors under the `errors` property.
 * @param promises Promises to handle.
 */
export function when<T>(promises: Iterable<Promise<T> | T>): Promise<T[]> {
    return settle(promises).then(settled => {
        const result = settled
            .filter(promise => promise.isFulfilled)
            .map(promise => promise.value());

        if (result.length > 0) {
            return result;
        } else {
            throw new WhenError(settled);
        }
    });
}
