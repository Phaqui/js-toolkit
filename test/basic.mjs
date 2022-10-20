import t from "tap";

import { iter } from "../src/index.mjs";
import { all, range, repeat, zip, Empty } from "../src/new_impl.mjs";

t.test("avg()", { autoend: true }, t => {
    t.test("correct math", { autoend: true }, t => {
        t.strictSame(
            6,
            iter([6]).avg(),
            "6 === iter([6]).avg()",
        );

        t.strictSame(
            6,
            iter([3, 9]).avg(),
            "6 === iter([3, 9]).avg()",
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

    t.test("avg_or() returns the given value on Empty", { autoend: true }, t => {
        t.strictSame(
            5,
            iter([]).avg_or(5),
        );
    });

    t.test("avg_or() doesn't return the given value when non-empty", t => {
        t.notStrictSame(
            -100,
            iter([50, 50]).avg_or(-100),
            "-100 !== iter([50, 50]).avg_or(-100)",
        );
        t.end();
    });
});

t.test("repeat()", { autoend: true }, t => {
    t.test("endless repeater (when no second arg, e.g. repeat(5))", t => {
        t.test("actually never stops repeating", t => {
            t.pass("literally impossible to actually test :)");
            t.end();
        });
        t.end();
    });
});

t.test("zip()", { autoend: true }, t => {
    t.test("standalone zip()", { autoend: true }, t => {
        t.test("basic", { autoend: true }, t => {
            t.strictSame(
                [[1, 3], [2, 4]],
                zip([1, 2], [3, 4]).collect_array(),
                "[[1, 3], [2, 4]] === zip([1, 2], [3, 4]).collect_array()"
            );
            t.end();
        });

        t.test("3-way zip", { autoend: true }, t => {
            t.strictSame(
                [[1, 3, 5], [2, 4, 6]],
                zip([1, 2], [3, 4], [5, 6]).collect_array(),
                "[[1, 3, 5], [2, 4, 6]] === zip([1, 2], [3, 4], [5, 6]).collect_array()",
            );
        });
    });
});


t.test("takewhile()", { autoend: true }, t => {
    t.strictSame(
        [0, 1, 2, 3],
        range(10).takewhile(x => x < 4).collect_array(),
        "[0, 1, 2, 3] === range(10).takewhile(x => x < 4).collect_array()",
    );
});


t.test("all()", { autoend: true }, t => {
    t.test("standalone all()", { autoend: true }, t => {
        t.test("basic", { autoend: true }, t => {
            t.ok(
                all([5, 6, 7], x => x > 2),
                "true === all([5, 6, 7], x => x > 2)",
            );
        });

        t.test("default predicate of truthycheck", { autoend: true }, t => {
            t.ok(
                all([true, 1, [], {}]),
                "true === all([true, 1, [], {}])",
            );
        });
    });

    t.test("iter.all() as a XXX conclusion method", { autoend: true }, t => {
        t.ok(
            iter([1, 2, 3]).all(),
            "iter([1, 2, 3]).all()",
        );

        t.ok(
            iter([false, false, false]).map(x => true).all(),
            "iter([false, false, false]).map(x => true).all()",
        );
    });
});


t.test("chain()", { autoend: true }, t => {
    t.test("yep", { autoend: true }, t => {
        t.strictSame(
            [1, 1, 1, 2, 2, 2],
            repeat(1, 3).chain(repeat(2, 3)).collect_array(),
        );
    });
});

