import t from "tap";
import { iter, Empty } from "../src/index.mjs";

t.test("Iter.avg()", { autoend: true }, t => {
    t.test("correct math", { autoend: true }, t => {
        t.strictSame(
            6,
            iter([6]).average(),
            "6 === iter([6]).average()",
        );

        t.strictSame(
            6,
            iter([3, 9]).average(),
            "6 === iter([3, 9]).average()",
        );
    });

    t.test("ignores all values that are strictly not numbers", t => {
        t.strictSame(
            2,
            iter([1, 3, undefined, null, true, false, [], [1], [1, 2], {}, {a:1}])
                .avg(),
            "2 === iter([1, 3, undefined, null, true, false, [], [1], [1, 2], {}, {a:1}]).avg()",
        );
        t.end();
    });

    t.test("throws Empty when iterator is empty", { autoend: true }, t => {
        t.throws(() => iter([]).avg(), new Empty());
    });

    t.test("average_or() returns the given value on Empty", t => {
        t.strictSame(
            5,
            iter([]).average_or(5),
            "5 === iter([]).average_or(5)",
        );
        t.end();
    });

    t.test("average_or() doesn't return the given value when non-empty", t => {
        t.strictNotSame(
            -100,
            iter([50, 50]).average_or(-100),
            "-100 !== iter([50, 50]).average_or(-100)",
        );
        t.end();
    });
});
