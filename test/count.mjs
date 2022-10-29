import t from "tap";
import { count } from "../src/index.mjs";

t.test("basic", { autoend: true }, t => {
    t.strictSame(
        [0, 1, 2, 3, 4],
        count().take(5).collect_array(),
        "[0, 1, 2, 3, 4] === count().take(5).collect_array()",
    );
});
