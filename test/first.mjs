import t from "tap";

import { iter, first, Empty } from "../src/new_impl.mjs";

t.test("first()", { autoend: true }, t => {
    t.test("takes the first value when there's many", t => {
        t.strictSame(
            1,
            iter([1, 2, 3]).first(),
            "1 === iter([1, 2, 3]).first()"
        );
        t.end();
    });

    t.test("takes the only value when there's only one", t => {
        t.strictSame(
            6,
            iter([6]).first(),
            "6 === iter([6]).first()",
        );
        t.end();
    });

    t.test("throws Empty when iter is empty", { autoend: true }, t => {
        t.throws(() => iter([]).first(), new Empty());
    });
});
