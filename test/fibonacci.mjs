import t from "tap";

import { fibonacci } from "../src/index.mjs";

t.test("Fibonacci works", { autoend: true }, t => {
    t.strictSame(
        [0, 1, 1, 2, 3, 5, 8, 13, 21, 34],
        fibonacci().take(10).collect_array()
    );
});
