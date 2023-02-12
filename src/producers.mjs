import { iter, _iter } from "./iter.mjs";
import { _sieve_of_eratosthenes } from "./eratosthenes.mjs";

export const count = (start = 0, step = 1) => iter(_count(start, step));
export const range = (...args) => iter(_range(...args));
export const fibonacci = () => iter(_fibonacci());
export const enumerate = (obj) => iter(_enumerate(obj));
export const repeat = (val, n = null) => iter(_repeat(val, n));
export const chain = (...iters) => iter(_chain(...iters));
export const permutations = (arr) => iter(_permutations(arr));
export const primes = () => iter(_primes());
export const intersperse = (obj, val) => iter(_intersperse(obj, val));
export const zip = (...iters) => iter(_zip(...iters));

export function *_count(start = 0, step = 1) {
    for (;; start += step) yield start;
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

export function *_enumerate(obj) {
    let it = _iter(obj);
    let i = 0;
    for (let val of it) {
        yield [i++, val];
    }
}

function *_chain(...iterables) {
    for (const iterable of iterables) {
        const current_it = _iter(iterable);
        for (const val of current_it) {
            yield val;
        }
    }
}

export function *_fibonacci() {
    let a = 0, b = 1;
    while (true) {
        yield a;
        const tmp = b;
        b = a + b;
        a = tmp;
    }
}

function *_primes() {
    for (const val of _sieve_of_eratosthenes()) {
        yield val;
    }
}

export function *_zip(...iterables) {
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

export function *_intersperse(obj, value) {
    const it = _iter(obj);
    let a = it.next();
    if (a.done) return;
    yield a.value;
    let b = it.next();
    if (b.done) return;
    yield value;
    yield b.value;
    while (true) {
        a = it.next();
        if (a.done) break;
        yield value;
        yield a.value;
    }
}

export function *_product(iterables, repeat = 1) {
    // iterables is an array (or iterable) of iterables (or arrays)
    // iterables = [a, b, c, ...]
    const array = [...iterables];
    const lengths = array.map(arr => arr.length - 1);
    for (const indexes of odometer(...lengths)) {
        yield [...zip(array, indexes).map(([arr, i]) => arr[i])];
    }
}

function *odometer(...limits) {
    // limits = [5, 4, 5]
    // [0, 0, 0], [0, 0, 1], [0, 0, 2], ... [0, 0, 5],
    // [0, 1, 0], [0, 1, 1], ...
    const n = limits.length;
    let i = n - 1;
    const res = [...repeat(0, n)];
    yield res;
    outer: while (true) {
        let i = n - 1;
        while (true) {
            res[i]++;
            if (res[i] <= limits[i]) {
                break;
            } else {
                res[i--] = 0;
                if (i < 0) break outer;
            }
        }
        // must copy here, if not, the same array reference is returned
        // over and over
        yield [...res];
    }
}

export function *_permutations(arr) {
    const n = arr.length;
    const repeated = [];
    for (let i = 0; i < n; i++) repeated.push([...arr]);
    for (const x of _product(repeated)) {
        const s = new Set(x);
        if (s.size === arr.length) {
            yield [...x];
        }
    }
}

// TODO
export function *split(s, by, { keep_splits = false } = {}) {
    // split("a,b,c", ",") => a b c
    // split([1, 2, 3, 0, 5, 3, 0, 9], 0) => [1, 2, 3] [5 3] [9]
    //
    // if s can be any iterable, then.. need to keep the elements we loop over
    let next_result;
    for (const x of s) {
        if (x === by) {
            yield next_result;
            next_result = null;
            if (keep_splits) yield x;
        } else {
            next_result += x;
        }
    }
}
