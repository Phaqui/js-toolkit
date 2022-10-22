import t from "tap";
import { iter, sum, Empty } from "../src/index.mjs";

t.test("Iter.sum()", { autoend: true }, t => {
    t.test("correct sum", { autoend: true }, t => {
        t.strictSame(
            15,
            iter([1, 2, 3, 4, 5]).sum(),
            "15 === iter([1, 2, 3, 4, 5]).sum()",
        );
    });

    t.test("throws Empty when empty iterable", { autoend: true }, t => {
        t.throws(() => iter([]).sum(), new Empty());
    });
});

t.test("Iter.sum_or()", { autoend: true }, t => {
    t.test("When given non-empty iterator", { autoend: true }, t => {
        t.test("correct sum", { autoend: true }, t => {
            t.strictSame(
                15,
                iter([1, 2, 3, 4, 5]).sum_or(-2),
                "15 === iter([1, 2, 3, 4, 5]).sum_or(-2)",
            );
        });
    });

    t.test("When given empty iterator", { autoend: true }, t => {
        t.test("returns or-value", { autoend: true }, t => {
            t.strictSame(
                -2,
                iter([]).sum_or(-2),
                "-2 === iter([]).sum_or(-2)",
            );
        });
    });
});

/*
t.test("standalone sum()", { autoend: true }, t => {
});

t.test("standalone sum_or()", { autoend: true }, t => {
});
*/
