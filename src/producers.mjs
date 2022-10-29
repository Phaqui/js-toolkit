import { iter, _iter } from "./iter.mjs";

export const count = (start = 0, step = 1) => iter(_count(start, step));
export const range = (...args) => iter(_range(...args));
export const fibonacci = () => iter(_fibonacci());
export const enumerate = (obj) => iter(_enumerate(obj));
export const repeat = (val, n = null) => iter(_repeat(val, n));
export const chain = (...iters) => iter(_chain(...iters));
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



// Sieve of Eratosthenes
// Code by David Eppstein, UC Irvine, 28 Feb 2002
// http://code.activestate.com/recipes/117119/
// transliterated to js
function *_sieve_of_eratosthenes() {
    const D = new Map();
    let q = 2;
    while (true) {
        if (!D.has(q)) {
            yield q;
            D.set(q * q, [q])
        } else {
            for (let p of D.get(q)) {
                let t = p + q;
                if (D.has(t)) {
                    D.get(t).push(p);
                } else {
                    D.set(t, [p]);
                }
            }
            D.delete(q);
        }
        q += 1;
    }
}


