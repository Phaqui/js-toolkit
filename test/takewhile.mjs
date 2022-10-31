import t from "tap";

import { iter } from "../src/index.mjs";

t.test("Iter.takewhile()", { autoend: true }, t => {
    t.strictSame(
        [5,4,3],
        iter([5,4,3,2,1]).takewhile(x => x >= 3).collect_array(),
        "[5,4,3] === iter([5,4,3,2,1]).takewhile(x => x >= 3).collect_array()",
    );
});
