const line_re = /^at (?<fname>.+) \((?<fpath>.+):(?<lineno>\d+):\d+\)$/;
let __failure = false;

function _iter(obj) {
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

    throw new TypeError("_iter(): don't know how to make an iterator out of that");
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

export class Empty extends Error {
    constructor(...params) {
        super(...params);
        this.name = "Empty";
    }
}

class Iter {
    #iter;

    constructor(obj, { _custom_iter } = {}) {
        this.#iter = _custom_iter ?? _iter(obj);
    }

    *[Symbol.iterator]() {
        for (const val of this.#iter) {
            yield val;
        }
    }

    filter(fn) { this.#iter = _filter(this.#iter, fn); return this; }
    map(fn) { this.#iter = _map(this.#iter, fn); return this; }
    take(n) { this.#iter = _take(this.#iter, n); return this; }
    takewhile(pred) { this.#iter = _takewhile(this.#iter, pred); return this; }

    all(pred) {
        return all(this.#iter, pred);
    }

    first() {
        const next = this.#iter.next();
        if (next.done) throw new Empty();
        return next.value;
    }

    avg() {
        let n = 0;
        let sum = 0;
        for (const curr of this.#iter) {
            const number = _num(curr);
            if (Number.isNaN(number)) continue;
            sum += number;
            n++;
        }
        if (n === 0) throw new Empty();
        return sum / n;
    }
    sum() { return this.reduce((a, b) => a + b); }
    reduce(fn, start) {
        let result, prev;
        if (typeof start === "undefined") {
            prev = this.#iter.next().value;
        } else {
            prev = start;
        }

        for (const curr of this.#iter) {
            result = fn(prev, curr);
            prev = result;
        }
        return result;
    }
    collect_array() { return [...this.#iter]; }
    collect_object() {
        const res = {};
        for (const x of this.#iter) {
            if (Array.isArray(x)) {
                res[x[0]] = x[1];
            } else if (is_pojo(x)) {
                Object.assign(res, x);
            } else {
                res[x] = x;
            }
        }
        return res;
    }
}

export function iter(obj) { return new Iter(obj); }

function *_filter(iterable, fn) {
    for (let val of iterable) {
        if (fn(val)) yield val;
    }
}

function *_map(iterable, fn) {
    for (let val of iterable) {
        yield fn(val);
    }
}

function *_range(...args) {
    let start = 0, stop = null, step = 1;
    switch (args.length) {
        case 1: stop = args[0]; break;
        case 2: start = args[0]; stop = args[1]; break;
        case 3: start = args[0]; stop = args[1]; step = args[2]; break;
    }

    const going_up = step > 0;
    let i = start;
    if (going_up) {
        for (; i < stop; i += step) yield i;
    } else {
        for (; i > stop; i += step) yield i;
    }
}

function *_repeat(value, n = null) {
    const always = n === null;
    while (always || n--) yield value;
}

function *_take(iterable, n) {
    for (const val of iterable) {
        yield val;
        if (!--n) break;
    }
}

function *_takewhile(iterable, pred) {
    for (const val of iterable) {
        if (!pred(val)) break;
        yield val;
    }
}

function *_fibonacci() {
    let a = 0, b = 1;
    while (true) {
        yield a;
        const tmp = b;
        b = a + b;
        a = tmp;
    }
}

function *_zip(...iterables) {
    const iterators = iterables.map(_iter);
    outer: while (true) {
        const next_result = [];
        for (const it of iterators) {
            const next_it_result = it.next();
            if (next_it_result.done) break outer;
            next_result.push(next_it_result.value);
        }
        yield next_result;
    }
}

function *_enumerate(obj) {
    let it = _iter(obj);
    let i = 0;
    for (let val of it) {
        yield [i++, val];
    }
}

export function enumerate(obj) {
    return new Iter(null, { _custom_iter: _enumerate(obj) });
}

export function fibonacci() {
    return new Iter(null, { _custom_iter: _fibonacci() });
}

export function zip(...iterables) {
    return new Iter(null, { _custom_iter: _zip(...iterables) });
}

export function range(...args) {
    return new Iter(null, { _custom_iter: _range(...args) });
}

export function repeat(value, n = null) {
    return new Iter(null, { _custom_iter: _repeat(value, n) });
}

const _default_all_pred = x => !!x;
export function all(iterable, pred = _default_all_pred) {
    const it = _iter(iterable);
    for (const val of it) {
        if (!pred(val)) return false;
    }
    return true;
}




function _num(obj) {
    if (Array.isArray(obj)) {
        // did you know Number([]) === 0 in js?
        // did you know Number([x]) === x in js? (where x is a number)
        return Number.NaN;
    }
    if (obj === null) {
        // did you know Number(null) === 0 in js?
        // (as a curiosity, Number() is 0, yet Number(undefined) is NaN)
        return Number.NaN;
    }
    if (typeof obj === "boolean") {
        // Number(False) is 0 and Number(True) is 1, that's actually okay,
        // but for our purposes, we don't want that.
        return Number.NaN;
    }
    return Number(obj);
}



/*

function test_range() {
    assert_eq(
        [0, 1, 2, 3, 4],
        range(5).collect_array(),
    );
}

function test_take_n() {
    assert_eq(
        [1, 1, 1],
        repeat(1).take(3).collect_array()
    );
}

function test_first() {
    assert_eq(
        iter([1, 2]).first(),
        1
    );
}

function test_reduce() {
    assert_eq(
        5050,
        range(0, 101).reduce((a, b) => a + b)
    );
}

function test_sum() {
    assert_eq(
        100,
        repeat(1, 100).sum()
    );
}

function test_fibonacci() {
    const first_fibs = [0, 1, 1, 2, 3, 5, 8, 13];
    assert_eq(
        first_fibs,
        fibonacci().take(first_fibs.length).collect_array()
    );

    assert_eq(
        547,
        parseInt(fibonacci().take(20).avg())
    );

    assert_eq(
        10945,
        parseInt(fibonacci().take(20).sum())
    );
}

function test_zip() {
    const a = range(5).map(i => String.fromCharCode(97 + i));
    const b = repeat("-");
    const c = "ABCDE";
    const expected = ["a-A", "b-B", "c-C", "d-D", "e-E"];
    const got = zip(a, b, c).map(([x, y, z]) => x + y + z).collect_array();
    assert_eq(expected, got);
}

function test_enumerate() {
    assert_eq(
        enumerate(["A", "B", "C"])
            .map( ([i, val]) => ({ [val]: i }) )
            .collect_object(),
        { A: 0, B: 1, C: 2, D: 3}
    );
}

const TESTS = [
    test_range,
    test_take_n,
    test_first,
    test_reduce,
    test_sum,
    test_fibonacci,
    test_zip,
    test_enumerate,
];

function run_tests() {
    const test_results = [];
    for (const t of TESTS) {
        __failure = false;
        try { t(); } catch (e) { }
        if (__failure) {
            test_results.push(false);
            console.log(__failure);
        } else {
            test_results.push(true);
        }
    }

    const any_failures = test_results.some(result => result === false);
    if (any_failures) {
        console.log("Test failed");
    } else {
        console.log("All tests completed successfully");
    }
}
run_tests();


function assert_eq(a, b) {
    const ok = __eq(a, b);
    if (ok) return;
    try { throw Error(); } catch (e) {
        //console.log(e);
        const stacklines = e.stack.split("\n");
        const l2 = stacklines[2].trim();
        let m = line_re.exec(l2);
        const { fname, fpath, lineno } = m.groups;
        __failure = `Fail: ${fname}() (line ${lineno}) assert_eq(left, right), left = ${fmt(a)}. right = ${fmt(b)}`

        // to signal to run_tests() that the test failed, so it stops
        // executing
        throw Error();
    }
}

function __eq(a, b) {
    if (Array.isArray(a)) {
        if (!Array.isArray(b)) return false;
        return __array_eq(a, b);
    }

    if (is_pojo(a)) {
        if (!is_pojo(b)) return false;
        return __pojo_eq(a, b);
    }

    return a === b;
}

function __array_eq(a, b) {
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

function __pojo_eq(a, b) {
    const a_it = Object.entries(a);
    const b_it = Object.entries(b);

    const keys_match = __set_eq(
        new Set(Object.keys(a)),
        new Set(Object.keys(b)),
    );

    if (!keys_match) return false;

    for (const [key, a_value] of Object.entries(a)) {
        const same_entry = __eq(a[key], b[key]);
        if (!same_entry) return false;
    }

    return true;
}

function __set_eq(a, b) {
    let n1 = __set_diff(a, b);
    let n2 = __set_diff(b, a);
    return n1.size === 0 && n2.size === 0;
}

function __set_diff(a, b) {
    const diff = new Set(a);
    for (let el of b) {
        diff.delete(el);
    }
    return diff;
}

function fmt_pojo(pojo) {
    const parts = [];
    for (const [key, value] of Object.entries(pojo)) {
        parts.push(`${key}: ${value}`);
    }
    return `{ ${parts.join(", ")} }`;
}

function fmt_array(arr) {
    let chunks = arr.map(fmt);
    return `[ ${chunks.join(", ")} ]`;
}

function fmt(val) {
    switch (typeof val) {
        case "string":
        case "number":
        case "boolean":
        case "undefined":
            return val.toString();
    }
    if (val === null) return "<null>";
    if (Array.isArray(val)) return fmt_array(val);
    if (is_pojo(val)) return fmt_pojo(val);
    return String(val);
}
*/
