import t from "tap";

import { AUTOEND } from "./util.mjs";

import { iter, median, Empty } from "../src/index.mjs";

t.test("standalone median() function", AUTOEND, t => {
    t.throws(() => median([]), Empty, "median([]) throws Empty");
    t.strictSame(42, median([42]), "42 === median([42])");
    t.strictSame(1.5, median([1, 2]), "1.5 === median([1, 2])");
    t.strictSame(3, median([0, 3, 100]), "3 === median([0, 3, 100])");
    t.strictSame(
        17.5,
        median([10, 15, 20, 25]),
        "17.5 === median([10, 15, 20, 25])",
    );
    t.strictSame(
        15,
        median([5, 10, 15, 20, 25]),
        "15 === median([5, 10, 15, 20, 25])",
    );
});

t.test("iter().median()", AUTOEND, t => {
    t.throws(() => iter([]).median(), Empty, "iter([]).median() throws Empty");
    t.strictSame(69, iter([]).median_or(69), "69 === iter([]).median_or(69)");
    t.strictSame(42, iter([42]).median(), "42 === iter([42]).median()");
    t.strictSame(1.5, iter([1, 2]).median(), "1.5 === iter([1, 2]).median()");
    t.strictSame(3, iter([0, 3, 100]).median(), "3 === iter([0, 3, 100]).median()");
    t.strictSame(
        17.5,
        iter([10, 15, 20, 25]).median(),
        "17.5 === iter([10, 15, 20, 25]).median()",
    );
    t.strictSame(
        15,
        iter([20, 25, 5, 10, 15]).median(),
        "15 === iter([20, 25, 5, 10, 15]).median()",
    );
});
