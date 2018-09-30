// Based on When.js tests
//
// Open Source Initiative OSI - The MIT License
//
// http://www.opensource.org/licenses/mit-license.php
//
// Copyright (c) 2011 Brian Cavalier
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import { settle } from "../promise-settle";

const sentinel = {};

describe("settle()", () => {
  it("should settle empty arrays", async () => {
    expect(await settle([])).toHaveLength(0);
  });

  it("should reject if promise for input array rejects", async () =>
    expect(settle(Promise.reject(sentinel) as any)).rejects.toBe(sentinel));

  it("should reject if the input is not an array", async () =>
    expect(settle(undefined as any)).rejects.toThrow(
      "Expected an iterable of Promises"
    ));

  it("should settle values", async () => {
    var array = [0, 1, sentinel];
    const settled = await settle(array);
    settled.forEach((result, index) => {
      expect(result.isFulfilled).toBe(true);
      expect(result.value()).toBe(array[index]);
      expect(() => result.reason()).toThrow("Promise is fulfilled");
    });
  });

  it("should settle promises", async () => {
    var array = [0, Promise.resolve(sentinel), Promise.reject(sentinel)];
    const settled = await settle(array);
    expect(settled[0].isFulfilled).toBe(true);
    expect(settled[0].value()).toBe(0);

    expect(settled[1].isFulfilled).toBe(true);
    expect(settled[1].value()).toBe(sentinel);
    expect(settled[1].reason).toThrow("Promise is fulfilled");

    expect(settled[2].isFulfilled).toBe(false);
    expect(settled[2].reason()).toBe(sentinel);
    expect(settled[2].value).toThrow("Promise is rejected");
  });

  /**
   * @see {@link https://github.com/pgaubatz/node-promise-settle/issues/4}
   */
  it("issue #4", async () => {
    const results = await settle([aPromiseMethod()]);
    expect(results[0].isFulfilled).toBe(false);

    function aPromiseMethod() {
      return new Promise((_resolve, reject) => reject());
    }
  });
});
