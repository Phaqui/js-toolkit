import t from "tap";
import { iter, last, Empty } from "../src/index.mjs";

t.test("Iter.last()", { autoend: true }, t => {
    t.test("returns the last item", { autoend: true }, t => {
        t.strictSame(
            1,
            iter([1]).last(),
            "1 === iter([1]).last()",
        );
        t.strictSame(
            5,
            iter([3, 6, 5]).last(),
            "5 === iter([3, 6, 5]).last()",
        );
    });

    t.test("throws Empty on an empty iterator", { autoend: true }, t => {
        t.throws(
            () => iter([]).last(), new Empty(),
            "iter([]).last() throws Empty"
        );
    });

});

t.test("Iter.last_or()", { autoend: true }, t => {
    t.test("when given non-empty iterable", { autoend: true }, t => {
        t.test("returns last item from iterable (not the or-value)", t => {
            t.strictSame(
                3,
                iter([1, 2, 3]).last_or(-1),
                "3 === iter([1, 2, 3]).last_or(-1)",
            );
            t.end();
        });

    });

    t.test("when given empty iterable", { autoend: true }, t => {
        t.test("returns the or-value", { autoend: true }, t => {
            t.strictSame(
                -1,
                iter([]).last_or(-1),
                "-1 === iter([]).last_or(-1)",
            );
        });
    });
});

t.test("standalone last()", { autoend: true }, t => {
    t.test("returns the last item", { autoend: true }, t => {
        t.strictSame(
            5,
            last(iter([3, 6, 5])),
            "5 === iter([3, 6, 5]).last()",
        );
    });

    t.test("returns the only value when there is only one", t => {
        t.strictSame(
            5,
            last([5]),
            "5 === last([5])",
        );
        t.end();
    });

    t.test("throws Empty on empty iterator", { autoend: true }, t => {
        t.throws(
            () => last(iter([])), new Empty(),
            "last(iter([])) throws Empty",
        );
    });
});
