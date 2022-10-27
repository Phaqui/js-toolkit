# js-toolkit

My own collection of helpful and interesting javascript things.

# SCRATCH

This project is just a *scratch*. It is nowhere near even an _alpha_ state. For demonstration purposes only.

# examples

```javascript
import { iter } from "somewhere";

iter([1, 2, 3, 4]).sum() === 10

iter({ A: 1, B: 2, C: 3 }).map(([k, v]) => [k + k, v * v]).collect_object() === { AA: 1, BB: 4, CC: 9 }
```

## Producers (starting points of iteration):

count, range, fibonacci, enumerate, repeat, chain, primes, intersperse, zip.

## Processors (iterators that take an iterator, and processes it in some way)

filter, map, take, takewhile, takeuntil, skip, group

## Finishers (consumes an iterator to produce a single result

any, all, count, join, first, last, reduce, average, sum

## group()

Use `.group()` to create sub-iterators of different "groups" of
values coming in from the iterator chain. The function passed to
`.group()` determines how to define which group a value belongs to.
`.match(value)` will create a sub-iterator, that will only recieve items
which belong to that group.

After the last _match arm_ (along with it's iterator chain) has been specified,
use `.gather()` to return to the outer iterator. The elements `.gather()` will
iterate over, are 2-tuples. The first element being the _match_arm_ value, the
second being the result of the iterator chain for that match arm.

The example below hopefully helps clear things up.

```javascript
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
    .gather()
    .collect_object();

// generated === { A: 3, B: 30, C: 300 };
```
