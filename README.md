# js-toolkit

My own collection of useful javascript things.


# Warning

There are tests, but they are probably incomplete. Terminology may change. The interface may change. For demonstration purposes only.


## array.shuffle

Shuffles an array into random order, in place. Returns the same array.

```javascript
import { shuffle } from "js-toolkit/array";

const arr = [1, 2, 3, 4, 5];
shuffle(arr); // now in random order
```

If you want to _monkey-patch_ the function so it is available on every array, do:

```javascript
import { patch_array_shuffle } from "js-toolkit/array";
patch_array_shuffle();

let shuffled = [1, 2, 3, 4, 5].shuffle();
```

## SaneSet

An extention of *Set* that has _set methods_ on it. Includes _is_empty()_, _difference()_

```javascript
import { SaneSet } from "js-toolkit/SaneSet";
```

function | what it does
_is_empty()_ | self-explanatory
_equals(other)_ | Shallowly check if the same elements are in both sets
_difference(other)_ | Compute the set difference between _this_ and _other_
_intersection(...others)_ | Compute the intersection of _this_ and the _others_
_union(...others)_ | The union of _this_ and the _others_
_is\_disjoint(...others)_ | Is _this_ disjoint from all the _others_
_pop()_ | Remove and return a randomly selected element from the set. Throws *Empty* if the set is empty.

These functions are also available as stand-alone versions.


## iter

Use the *iter()* function to get a _custom iterable_ from a native iterable, or object. The iterator created from an object iterates over that object's own enumeratable keys and values.

The _custom iterable_ is itself an _iterable_, and can be used in places which accepts an iterable, such as a _for loop_, or as the argument to a collection constructor that accepts building a new collection from an iterable. For example:

```javascript
import { iter } from "js-toolkit";

for (const x of iter([1, 2, 3, 4, 5])) {
    console.log(x); // 1 2 3 4 5
}

for (const [key, value] of iter({a: 1, b: 2, c: 3})) {
    console.log(key, value); // a 1, b 2, c 3
}

const it = iter([1, 2, 3, 4, 5]).map(x => x ** 2);
let set1 = new Set(it); // set of 1 4 9 16 25
```

The iterable has a number of _chainable_ methods on it. Usual suspects like *.map()* and *.filter()*, but also numerous others, that will alter what the iterable iterates over. (Yes, this is heavily inspired from Python's _itertools_). A few examples:

```javascript
import { iter, count } from "js-toolkit";
count()                                // 0 1 2 3 4 5 6 7 8 9 10 11 12 ...
    .takewhile(x => x < 8)             // 0 1 2 3 4 5 6 7
    .filter(x => x % 2 === 0)          // 0 2 4 6
    .map(x => x * 3)                   // 0 6 12 18
    .sum();                            // 36

iter({ A: 1, B: 2, C: 3 })             // [A, 1] [B, 2] [C, 3]
    .map(([k, v]) => [k + k, v * v])   // [AA, 1 * 1] [BB, 2 * 2] [CC, 3 * 3]
    .collect_object();                 // { AA: 1, BB: 4, CC: 9 }
```

## Producers (starting points of iteration):

count, range, fibonacci, enumerate, repeat, chain, primes, intersperse, zip.

## Processors (alters what the iterator iterator, and processes it in some way)

filter, map, take, takewhile, takeuntil, skip, group

## Finishers (consumes an iterator to produce a single result

any, all, count, join, first, last, reduce, average, sum, max, min

## Collectors

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
