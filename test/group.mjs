import t from "tap";

import { iter, _else } from "../src/index.mjs";

const items = [
    { type: "A", value: 1 },
    { type: "B", value: 10 },
    { type: "C", value: 100 },
    { type: "A", value: 2 },
    { type: "B", value: 20 },
    { type: "C", value: 200 },
    { type: "D", value: 69 },
];

const pick_value = ({ value }) => value;

const generated =
    iter(items)
    .group(({ type }) => type)
      .match("A").map(({ value }) => value).map(x => x + 1).sum()
      .match("B").map(({ value }) => value).sum()
      .match("C").map(({ value }) => value).sum()
      .match(_else).map(({ value }) => value).sum()
    .gather()
    .map(([_, value]) => value)
    .sum();
    //.collect_object();

console.log("generated object");
console.log(generated);
console.log("/generated object");
//const expected = { A: 5, B: 30, C: 300, __default: 69 };
const expected = 404;

t.test("it works", { autoend: true }, t => {
    t.strictSame(generated, expected);
});
