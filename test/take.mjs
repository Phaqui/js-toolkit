import t from "tap";

import { iter } from "../src/index.mjs";

/* Notes:
 * the code: iter(...).map(has_side_effect).take(0)
 * will execute the side effect found in .map() once, because take has
 * not yet had a chance to run even once. However, ...take(1) (and higher),
 * will lead the iterator to stop after exactly that many things have been
 * processed, and no additional side effects will occur.
 */
t.test("Iter.take()", { autoend: true }, t => {
    t.test("take(0) takes no items", { autoend: true }, t => {
        t.strictSame(
            [],
            iter([1,2,3,4]).take(0).collect_array(),
            "[] === iter([1,2,3,4]).take(0).collect_array()",
        );
    });

    t.test("takes only n values", { autoend: true }, t => {
        t.strictSame(
            [1,2,3],
            iter([1,2,3,4,5]).take(3).collect_array(),
            "[1,2,3] === iter([1,2,3,4,5]).take(3).collect_array()",
        );
    });
});
