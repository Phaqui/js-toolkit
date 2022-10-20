import { iter } from "./iter.mjs";

const mapping_fn = (x, y) => { return [x + x, y + y]; };

let a = iter({ A: 1, B: 2 }).map(mapping_fn).collect_object();
console.log("A has run:");
console.log(a);
