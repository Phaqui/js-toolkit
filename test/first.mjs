import t from "tap";
import { iter, first, Empty } from "../src/index.mjs";

t.test("Iter.first()", { autoend: true }, t => {
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

t.test("Iter.first_or()", { autoend: true }, t => {
    t.test("takes the first value of the iterator when non-empty", t => {
        t.strictSame(
            3,
            iter([3, 4, 5]).first_or(-1),
            "3 === iter([3, 4, 5]).first_or(-1)",
        );
        t.end();
    });

    t.test("takes the default value when iterator is empty", t => {
        t.strictSame(
            -1,
            iter([]).first_or(-1),
            "-1 === iter([]).first_or(-1)",
        );
        t.end();
    });
});

t.test("standalone first()", { autoend: true }, t => {
    t.test("takes the first value when there's many", t => {
        t.strictSame(
            1,
            first([1, 2, 3]),
            "1 === first([1, 2, 3])"
        );
        t.end();
    });

    t.test("takes the only value when there's only one", t => {
        t.strictSame(
            6,
            first([6]),
            "6 === first([6])",
        );
        t.end();
    });


    t.test("throws Empty when iter is empty", { autoend: true }, t => {
        t.throws(() => first([]), new Empty());
    });
});
