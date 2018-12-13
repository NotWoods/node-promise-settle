export interface Settled<T> {
    /** True if the promise fulfilled, false if rejected. */
    isFulfilled: boolean;
    /** Returns value if fulfilled, otherwise throws. */
    value(): T;
    /** Returns error if rejected, otherwise throws. */
    reason(): any;
}

/**
 * Returns a promise that is fulfilled when all items either fulfill or reject.
 *
 * Like Promise.all, except that it doesn't reject when a single promise rejects.
 * Based on the "promise-settle" npm package.
 * @param promises Promises to handle.
 * @see {@link https://github.com/pgaubatz/node-promise-settle/blob/master/lib/promise-settle.js}
 */
export function settle<T>(
    promises: Iterable<Promise<T> | T>,
): Promise<Array<Settled<T>>> {
    return Promise.resolve(promises).then(_settle);
}

/**
 * Inner function for `settle`.
 */
function _settle<T>(
    promises: Iterable<Promise<T> | T>,
): Promise<Array<Settled<T>>> {
    if (!_isIterable(promises)) {
        throw new TypeError('Expected an iterable of Promises');
    }

    return Promise.all(Array.from(promises, _settlePromise));
}

/**
 * Handle single promise for `settle`.
 */
function _settlePromise<T>(promise: Promise<T> | T): Promise<Settled<T>> {
    return Promise.resolve(promise).then(_promiseResolved, _promiseRejected);
}
function _promiseResolved<T>(result: T): Settled<T> {
    return {
        isFulfilled: true,
        value: () => result,
        reason: _isFulfilled,
    };
}
function _promiseRejected(err: any): Settled<never> {
    return {
        isFulfilled: false,
        value: _isRejected,
        reason: () => err,
    };
}

/** Returns true if `obj` is Iterable. */
function _isIterable(obj: any): obj is Iterable<any> {
    if (obj == null) return false;
    return typeof obj[Symbol.iterator] === 'function';
}

function _isRejected(): never {
    throw new Error('Promise is rejected');
}
function _isFulfilled(): never {
    throw new Error('Promise is fulfilled');
}
