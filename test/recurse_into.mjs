import t from "tap";
import { AUTOEND } from "./util.mjs";

import { iter } from "../src/index.mjs";

t.test("recurse_into()", AUTOEND, t => {
    t.strictSame(
        [1, 2, 3],
        iter([1, 2, 3]).recurse_into().collect_array(),
        "[1, 2, 3] === iter([1, 2, 3]).recurse_into().collect_array()",
    );

    t.strictSame(
        [1, 2, 3, 4],
        iter([1, 2, [3, 4]]).recurse_into().collect_array(),
        "[1, 2, 3, 4] === iter([1, 2, [3, 4]]).recurse_into().collect_array()",
    );

    t.strictSame(
        10,
        iter([1, 2, [3, [4, [5, 6], 7], 8], [9, [10]]]).recurse_into().count(),
        "10 === iter([1, 2, [3, [4, [5, 6], 7], 8], [9, [10]]]).recurse_into().count()",
    );
});
