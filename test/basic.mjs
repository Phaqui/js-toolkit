import t from "tap";

import { all, iter, range, zip, Empty } from "../src/new_impl.mjs";

t.test("first()", { autoend: true }, t => {
    t.test("actually takes the first value", t => {
        t.strictSame(
            1,
            iter([1, 2, 3]).first(),
            "1 === iter([1, 2, 3]).first()"
        );
        t.end();
    });

    t.test("throws Empty when iter is empty", { autoend: true }, t => {
        t.throws(() => iter([]).first(), new Empty());
    });
});

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
