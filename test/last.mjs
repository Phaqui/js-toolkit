import t from "tap";
import { iter, last, Empty } from "../src/new_impl.mjs";

t.test("iter.last()", { autoend: true }, t => {
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
