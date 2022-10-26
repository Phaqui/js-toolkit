import t from "tap";

import { iter } from "../src/index.mjs";

t.test("interspersement correct", { autoend: true }, t => {
    t.test("no interspersed value when empty iterator", { autoend: true }, t => {
        t.strictSame(
            [],
            iter([]).intersperse("X").collect_array(),
            "[] === iter([]).intersperse(\"X\").collect_array()",
        );
    });

    t.test("in interspersed value when iterator of 1 value", t => {
        t.strictSame(
            [1],
            iter([1]).intersperse("X").collect_array(),
            "[1] === iter([1].intersperse(\"X\").collect_array()",
        );
        t.end();
    });

    t.test("one interspersed value in between iterator of 2 values", t => {
        t.strictSame(
            [1, "X", 2],
            iter([1, 2]).intersperse("X").collect_array(),
            "[1, \"X\", 2] === iter([1, 2]).intersperse(\"X\").collect_array()",
        );
        t.end();
    });

    t.test("two interspersed values between iterator of 3 values", t => {
        t.strictSame(
            [1, "X", 2, "X", 3],
            iter([1, 2, 3]).intersperse("X").collect_array(),
            "[1, \"X\", 2, \"X\", 3] === iter([1, 2, 3]).intersperse(\"X\").collect_array()",
        );
        t.end();
    });
});
