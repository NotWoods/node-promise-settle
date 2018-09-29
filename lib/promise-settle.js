// @ts-check

/**
 * @template T
 * @typedef {object} Settled
 * @property {boolean} isFulfilled True if the promise fulfilled, false if rejected.
 * @property {() => T} value Returns value if fulfilled, otherwise throws.
 * @property {() => any} reason Returns error if rejected, otherwise throws.
 */

/**
 * Returns a promise that is fulfilled when all items either fulfill or reject.
 *
 * Like Promise.all, except that it doesn't reject when a single promise rejects.
 * Based on the "promise-settle" npm package.
 * @template T
 * @param {Iterable<Promise<T>>} promises Promises to handle.
 * @see {@link https://github.com/pgaubatz/node-promise-settle/blob/master/lib/promise-settle.js}
 * @returns {Promise<Array<Settled<T>>>}
 */
function settle(promises) {
  return Promise.resolve(promises).then(_settle);
}

/**
 * Inner function for `settle`.
 * @template T
 * @param {Iterable<Promise<T> | T>} promises
 * @returns {Promise<Array<Settled<T>>>}
 */
function _settle(promises) {
  if (!_isIterable(promises)) {
    throw new TypeError("Expected an iterable of Promises");
  }

  return Promise.all(Array.from(promises, _settlePromise));
}

/**
 * Handle single promise for `settle`.
 * @template T
 * @param {Promise<T> | T} promise
 * @returns {Promise<Settled<T>>}
 */
function _settlePromise(promise) {
  return Promise.resolve(promise).then(_promiseResolved, _promiseRejected);
}
/**
 * @template T
 * @param {T} result
 * @returns {Settled<T>}
 */
function _promiseResolved(result) {
  return {
    isFulfilled: true,
    value: () => result,
    reason: _isFulfilled
  };
}
/**
 * @param {any} err
 * @returns {Settled<never>}
 */
function _promiseRejected(err) {
  return {
    isFulfilled: false,
    value: _isRejected,
    reason: () => err
  };
}

/** Returns true if `obj` is Iterable. */
function _isIterable(obj) {
  if (obj == null) return false;
  return typeof obj[Symbol.iterator] === "function";
}

/** @returns {never} */
function _isRejected() {
  throw new Error("Promise is rejected");
}
/** @returns {never} */
function _isFulfilled() {
  throw new Error("Promise is fulfilled");
}

export { settle };
