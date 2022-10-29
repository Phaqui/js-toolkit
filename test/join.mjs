import t from "tap";
import { iter, repeat, join } from "../src/index.mjs";

t.test("joins simple strings", { autoend: true }, t => {
    t.strictSame(
        "1,2,3,4",
        iter([1,2,3,4]).join(","),
    );

    t.strictSame(
        "aaaaa",
        repeat("a").take(5).join(),
    );
});

t.test("standalone join()", { autoend: true }, t => {
    t.strictSame(
        "abc",
        join(["a", "b", "c"], ""),
    );
});
