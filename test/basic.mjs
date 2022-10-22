import t from "tap";

// XXX: My assumtion so far:
// this is an export that is not re-exported in index.mjs,
// thus not making it part of the public interface of this library
import { _iter } from "../src/iter.mjs";

import { iter } from "../src/index.mjs";

t.test("(internal) _iter() function", { autoend: true }, t => {
    t.test("if given iterator returns it right back untouched", t => {
        const it = ([1, 2])[Symbol.iterator]();
        t.ok(
            it === _iter(it),
            "it === _iter(it)  (given it = ([1, 2])[Symbol.iterator]())"
        );

        const first = _iter(it).next().value;
        const second = _iter(it).next().value;
        const done = _iter(it).next().done;

        t.ok(
            first === 1 && second === 2 && done,
            "iterating _iter(it) yielded 1, then 2, then it was done"
        );

        t.ok(
            it.next().done,
            "\"original\" (`it`) iterator was also exhausted",
        );

        t.end();
    });

    t.test("throws TypeError when given non-iterable", { autoend: true }, t => {
        const msg = type => `iter(): ${type} is not iterable`;
        t.throws(() => iter(), new TypeError(msg("undefined")));
        t.throws(() => iter(undefined), new TypeError(msg("undefined")));
        t.throws(() => iter(null), new TypeError(msg("null")));
        t.throws(() => iter(true), new TypeError(msg("boolean")));
        t.throws(() => iter(false), new TypeError(msg("boolean")));
    });
});

/*
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

*/
