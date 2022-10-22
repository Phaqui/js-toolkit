import t from "tap";
import { repeat, iter } from "../src/index.mjs";

t.test("standalone repeat()", { autoend: true }, t => {
    t.pass("it's good");
    t.end();
});

