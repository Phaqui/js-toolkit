import t from "tap";

import { iter } from "../src/index.mjs";

t.test("Iter.chain()", { autoend: true }, t => {
    t.test("basic", { autoend: true }, t => {
        t.strictSame(
            [1,2,3,4,5,6],
            iter([1,2,3]).chain([4,5,6]).collect_array(),
            "[1,2,3,4,5,6] === iter([1,2,3].chain([4,5,6]).collect_array()",
        );
    });

    t.test("follows processing chains before chaining on the next iterator", { autoend: true }, t => {
        t.strictSame(
            [10,20,30,4,5,6],
            iter([1,2,3]).map(x => x * 10).chain([4,5,6]).collect_array(),
            "[10,20,30,4,5,6] === iter([1,2,3]).map(x => x * 10).chain([4,5,6]).collect_array()",
        );
    });

    t.test("can chain another Iter object", { autoend: true }, t => {
        const three_ones_iter = iter([2,2,2]).map(x => x - 1);
        const six = iter([1, 1, 1]).chain(three_ones_iter).sum();
        t.strictSame(
            6,
            six,
            "6 === iter([1, 1, 1]).chain(three_ones_iter).sum()",
        );
    });

    t.test("can chain multiple times", { autoend: true }, t => {
        t.strictSame(
            6,
            iter([3]).chain([6]).chain([9]).average(),
            "6 === iter([3]).chain([6]).chain([9]).average()",
        );
    });

    t.test("accepts empty chains", { autoend: true }, t => {
        t.strictSame(
            9,
            iter([]).chain([]).chain([9]).chain([]).sum(),
            "1 === iter([]).chain([]).chain([1]).chain([]).sum()",
        );
    });
});
