import t from "tap";

import { iter, _else } from "../src/index.mjs";

const items = [
    { type: "A", value: 1 },
    { type: "B", value: 10 },
    { type: "C", value: 100 },
    { type: "A", value: 2 },
    { type: "B", value: 20 },
    { type: "C", value: 200 },
];


const generated =
    iter(items)
    .group(({ type }) => type)
      .match("A").map(({ value }) => value).sum()
      .match("B").map(({ value }) => value).sum()
      .match("C").map(({ value }) => value).sum()
      //.match(_else).map(({ value }) => value).sum()
    .gather()
    .collect_object();

console.log("generated object");
console.log(generated);
console.log("/generated object");
const expected = { A: 3, B: 30, C: 300 };

t.test("it works", { autoend: true }, t => {
    t.strictSame(generated, expected);
});
