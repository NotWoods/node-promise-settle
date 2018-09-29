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

import * as assert from "assert";
import { settle } from "../";

var sentinel = {};
var other = {};

describe("settle()", function() {
  it("should settle empty arrays", function() {
    return settle([]).then(settled => {
      assert.deepEqual(settled.length, 0);
    });
  });

  it("should reject if promise for input array rejects", function() {
    return settle(Promise.reject(sentinel)).then(assert.fail, reason => {
      assert.equal(reason, sentinel);
    });
  });

  it("should reject if the input is not an array", function() {
    return settle().catch(err => {
      assert.ok(err instanceof TypeError);
      assert.ok(err.message === "Expected an array of Promises");
    });
  });

  it("should settle values", function() {
    var array = [0, 1, sentinel];
    return settle(array).then(settled => {
      settled.forEach((result, index) => {
        assert.equal(result.isFulfilled(), true);
        assert.equal(result.isRejected(), false);
        assert.deepEqual(result.value(), array[index]);
      });
    });
  });

  it("should settle promises", function() {
    var array = [0, Promise.resolve(sentinel), Promise.reject(sentinel)];
    return settle(array).then(settled => {
      assert.equal(settled[0].isFulfilled(), true);
      assert.equal(settled[0].value(), 0);

      assert.equal(settled[1].isFulfilled(), true);
      assert.deepEqual(settled[1].value(), sentinel);
      assert.throws(settled[1].reason, Error);

      assert.equal(settled[2].isRejected(), true);
      assert.deepEqual(settled[2].reason(), sentinel);
      assert.throws(settled[2].value, Error);
    });
  });

  it("issue #4", function() {
    return settle([aPromiseMethod()]).then(results => {
      assert.ok(results[0].isRejected());
    });

    function aPromiseMethod() {
      return new Promise((_resolve, reject) => reject());
    }
  });
});
