// @ts-check
import { settle } from "./promise-settle";

/**
 * @template T
 * @typedef {object} Settled
 * @property {boolean} isFulfilled True if the promise fulfilled, false if rejected.
 * @property {() => T} value Returns value if fulfilled, otherwise throws.
 * @property {() => any} reason Returns error if rejected, otherwise throws.
 */

/**
 * Only thrown by `when`.
 */
class WhenError extends Error {
  /**
   * @param {Array<Settled<any>>} settled
   */
  constructor(settled) {
    super("All promises rejected");
    /** List of errors from rejected promises. */
    this.errors = settled.map(promise => promise.reason());
    Error.captureStackTrace(this, WhenError);
  }
}

/**
 * Returns a promise that is fulfilled when some items fulfill. Rejects if all items reject.
 *
 * Like Promise.all, except that it doesn't reject when a single promise rejects.
 * Instead, it ignores errors unless every single promise rejects.
 * If so, a `WhenError` is thrown with all the errors under the `errors` property.
 * @template T
 * @param {Iterable<Promise<T>>} promises Promises to handle.
 * @returns {Promise<T[]>}
 */
function when(promises) {
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

export { when, WhenError };
