import t from "tap";

import { fibonacci } from "../src/fibonacci.mjs";

t.test("basic", { autoend: true }, t => {
    t.strictSame(
        [0, 1, 1, 2, 3, 5, 8, 13, 21],
        fibonacci().take(9).collect_array()
    );
});
