// get an iterator from an object that is iterable
export function iter(obj) {
    if (typeof obj.next === "function") {
        // probably not a good enough check, but whatevs
        return obj;
    }

    const it = obj[Symbol.iterator];
    if (typeof it === "function") {
        return it.call(obj);
    }

    if (is_pojo(obj)) {
        return object_iter(obj);
    }

    throw new TypeError("iter(): don't know how to make an iterator out of that");
}

function *object_iter(obj) {
    for (let val in obj) {
        if (Object.hasOwn(obj, val)) {
            yield val;
        }
    }
}

function is_pojo(obj) {
    return !!obj && obj.constructor === Object;
}

class Zip {
    constructor(...iterables) {
        this.iterators = iterables.map(iter);
    }

    *[Symbol.iterator]() {
        outer: while (true) {
            const next_result = [];
            for (const el of this.iterators) {
                const next_it_result = el.next();
                if (next_it_result.done) break outer;
                next_result.push(next_it_result.value);
            }
            yield next_result;
        }
    }

    map(fn) { return new IteratorMap(this, fn); }
}

export function zip(...iterables) {
    return new Zip(...iterables);
}

export class IteratorMap {
    constructor(iterable, fn) {
        this.iterable = iterable;
        this.fn = fn;
    }

    *[Symbol.iterator]() {
        for (const next_args of this.iterable) {
            if (Array.isArray(next_args)) {
                yield this.fn.apply(this.fn, next_args);
            } else {
                yield this.fn.call(this.fn, next_args);
            }
        }
    }

    take_while(fn) { return new TakeWhile(this, fn); }
    collect_object() {
        let res = {};
        for (const x of this) {
            if (Array.isArray(x)) {
                res[x[0]] = x[1];
            } else {
                res[x] = x;
            }
        }
        return res;
    }
}

class Range {
    constructor(...args) {
        let start = 0, stop = null, step = 1;

        switch (args.length) {
            case 1: stop = args[0]; break;
            case 2: start = args[0]; stop = args[1]; break;
            case 3: start = args[0]; stop = args[1]; step = args[2]; break;
        }
        this.start = start;
        this.stop = stop;
        this.step = step;
    }

    *[Symbol.iterator]() {
        let going_up = this.step > 0;
        let i = this.start;
        if (going_up) {
            for (; i < this.stop; i += this.step) {
                //console.log("Range iterator", i);
                yield i;
            }
        } else {
            for (; i > this.stop; i -= this.step) yield i;
        }
    }

    map(fn) { return new IteratorMap(this, fn); }
    take(n) { return new Take(this, n); }
    filter(fn) { return new Filter(this, fn); }
    squared() { return new Squared(this); }
    take_while(fn) { return new TakeWhile(this, fn); }
}

class Squared {
    constructor(it) {
        this.it = it;
    }

    *[Symbol.iterator]() {
        for (const val of this.it) {
            yield val ** 2;
        }
    }

    take(n) { return new Take(this, n); }
    filter(fn) { return new Filter(this, fn); }
    squared() { return new Squared(this); }
}

function range(...args) {
    return new Range(...args);
}

class Filter {
    constructor(it, fn) {
        this.it = it;
        this.fn = fn.bind(fn);
    }

    *[Symbol.iterator]() {
        let fn = this.fn;
        for (let val of this.it) {
            //const discarded = !fn(val) ? " discarded" : "";
            //console.log(`Filter iterator: ${val}${discarded}`);
            if (fn(val)) yield val;
        }
    }

    take(n) {
        return new Take(this, n);
    }
}

class Take {
    constructor(it, n) {
        this.it = it;
        this.n = n;
    }

    *[Symbol.iterator]() {
        for (const val of this.it) {
            yield val;
            if (--this.n === 0) break;
        }
    }
}

class TakeWhile {
    constructor(it, fn) {
        this.fn = fn;
        this.it = it;
    }

    *[Symbol.iterator]() {
        for (const val of this.it) {
            if (!this.fn.call(this.fn, val)) break;
            yield val;
        }
    }
}

class Repeat {
    constructor(value, n = null) {
        if (n !== null && n <= 0) {
            throw new Error("Repeat: must repeat a positive amount of times");
        }

        if (n === null) {
            return new InfiniteRepeater(value);
        }

        this.value = value;
        this.n = n;
    }

    *[Symbol.iterator]() {
        while (this.n--) yield this.value;
    }
}

function repeat(value, n = null) {
    return new Repeat(value, n);
}

class InfiniteRepeater {
    constructor(value) {
        this.value = value;
    }

    *[Symbol.iterator]() {
        let value = this.value;
        while (true) yield value;
    }

    take(n) {
        return new Take(this, n);
    }
}

// unit tests, you know, gotta have that
function test_simple() {
    let a = [1, 2];
    let b = [3, 4];
    let expected = [ [1, 3], [2, 4] ];
    let got = Array(...zip(a, b));

    let ok = _array_eq(expected, got);
    if (!ok) error(expected, got);
}

function test_one_is_longer() {
    let a = [5, 6];
    let b = [7, 8, 9];
    let expected = [ [5, 7], [6, 8] ];
    let got = Array(...zip(a, b));

    let ok = _array_eq(expected, got);
    if (!ok) error(expected, got);
}

function test_with_map() {
    let a = [1, 2, 3, 4];
    let b = [5, 6, 7, 8];
    let expected = [5, 12, 21, 32];
    let got = Array(...zip(a, b).map((x, y) => x * y));
    let ok = _array_eq(expected, got);
    if (!ok) error(expected, got);
}

function test_with_map_longer() {
    let a = "abcde";
    let b = "-----";
    let c = "VWXYZ";
    let expected = ["a-V", "b-W", "c-X", "d-Y", "e-Z"];
    let got = Array(...zip(a, b, c).map((x, y, z) => x + y + z));
    let ok = _array_eq(expected, got);
    if (!ok) error(expected, got);
}

function test_repeater() {
    let expected = [1, 1, 1, 1];
    let got = Array(...repeat(1, 4));
    let ok = _array_eq(expected, got);
    if (!ok) error(expected, got);
}

function test_infinite_repeater_with_take() {
    let expected = ["a", "a", "a"];
    let got = [...repeat("a").take(3)];
    let ok = _array_eq(expected, got);
    if (!ok) error(expected, got);
}

const even = n => n % 2 === 0;

function test_range_with_filter() {
    let iterator = range(20).filter(even).take(6);
    let expected = [0, 2, 4, 6, 8, 10];
    let got = [...iterator];
    let ok = _array_eq(expected, got);
    if (!ok) error(expected, got);
}

function test_squared_range() {
    let it = range(20).squared();
    let got = [...it];
    // TODO  check expected eq to got
}

function effect(val) {
    console.log(val); return val;
}
function test_takewhile() {
    const got = [...
        range(20)
        .map(effect)
        .take_while(n => n < 5)
    ];
    console.log(got);
}




const tests = [
    test_repeater,
    test_simple,
    test_one_is_longer,
    test_with_map,
    test_with_map_longer,
    test_infinite_repeater_with_take,
    test_range_with_filter,
    test_squared_range,
    test_takewhile,
];


__VERBOSE = true;
function run_tests() {
    const test_results = [];
    for (const test of tests) {
        __LAST_ERRORED = false;
        test();
        const sign = __LAST_ERRORED ? "E" : ".";
        process.stdout.write(sign);
        test_results.push(!__LAST_ERRORED);
    }
    console.log();

    if (test_results.every(test_result => test_result === true)) {
        console.log("All tests completed successfully");
    }
}

run_tests();















var __LAST_ERRORED = false;
var __VERBOSE;
function error(expected, got) {
    __LAST_ERRORED = true;
    const e = fmt_array(expected);
    const g = fmt_array(got);

    // ugly/nice hack
    let func_name;
    try {
        throw Error()
    } catch (e) {
        const line = e.stack.split("\n")[2].trim().slice(3);
        const first_space = line.indexOf(" ");
        func_name = line.slice(0, first_space);
    }

    if (__VERBOSE)
        console.error(`${func_name} failed: expected ${e}, got ${g}`);
}


function _array_eq(a, b) {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (Array.isArray(a[i])) {
            if (!_array_eq(a[i], b[i])) return false;
        } else {
            if (a[i] !== b[i]) return false;
        }
    }

    return true;
}

function fmt_array(arr) {
    let chunks = ["["];
    for (const el of arr) {
        if (Array.isArray(el)) {
            chunks.push(fmt_array(el));
        } else {
            chunks.push(el);
        }
        chunks.push(",");
    }
    chunks.pop();
    chunks.push("]");
    return chunks.join("");
}
