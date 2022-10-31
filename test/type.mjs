import t from "tap";

import { type } from "../src/index.mjs";

t.test("type()", { autoend: true }, t => {
    t.strictSame("null", type(null),
        '"null" === type(null)');
    t.strictSame("undefined", type(undefined),
        '"undefined" === type(undefined)');
    t.strictSame("Boolean", type(true),
        '"Boolean" === type(true)');
    t.strictSame("Number", type(5),
        '"Number" === type(5)');
    t.strictSame("String", type("abc"),
        '"String" === type("abc")');
    t.strictSame("Symbol", type(Symbol()),
        '"Symbol" === type(Symbol())');
    t.strictSame("Array", type([]),
        '"Array" === type([])');
    t.strictSame("Uint8Array", type(new Uint8Array()),
        '"Uint8Array" === type(new Uint8Array())');
    t.strictSame("Object", type({}),
        '"Object" === type({})');
    t.strictSame("T", type(new class T {}()),
        '"T" === type(new class T {}())');
});
