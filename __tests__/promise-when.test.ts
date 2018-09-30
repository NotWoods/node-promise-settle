import { when, WhenError } from "../promise-when";

const sentinel = {};

describe("when()", () => {
  it("should reject if promise for input array rejects", async () =>
    expect(when(Promise.reject(sentinel) as any)).rejects.toBe(sentinel));

  it("should reject if the input is not an array", async () =>
    expect(when(undefined as any)).rejects.toThrow(
      "Expected an iterable of Promises"
    ));

  it("should when values", async () => {
    var array = [0, 1, sentinel];
    const settled = await when(array);
    expect(settled).toEqual(array);
  });

  it("should when promises", async () => {
    var array = [0, Promise.resolve(sentinel), Promise.reject(sentinel)];
    const settled = await when(array);

    expect(settled).toEqual([0, sentinel]);
  });

  /**
   * @see {@link https://github.com/pgaubatz/node-promise-settle/issues/4}
   */
  it("issue #4", async () => {
    const someErr = new Error();
    try {
      await when([aPromiseMethod()]);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeInstanceOf(WhenError);
      expect(err.errors).toEqual([someErr]);
    }

    function aPromiseMethod() {
      return new Promise((_resolve, reject) => reject(someErr));
    }
  });
});
