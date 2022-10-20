import { average, truthy, Empty, _num } from "./util.mjs";
import { zip } from "./producers.mjs";
import { first, last, reduce, sum, sum_or } from "./finishers.mjs";
import { _map, _take, _filter } from "./processors.mjs";

export function iter(obj) {
    return new Iter(obj);
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
    takeuntil(pred) { this.#iter = _takeuntil(this.#iter, pred); return this; }
    chain(iterable) { this.#iter = chain(this.#iter, iterable); return this; }
    zip(...iterables) { this.#iter = zip(this.#iter, ...iterables); return this;}
    intersperse(value) {
        this.#iter = _intersperse(this.#iter, value); return this; }

    all(pred = truthy) { return all(this.#iter, pred); }
    any(pred = truthy) { return any(this.#iter, pred); }

    first() { return first(this.#iter); }
    first_or(value) {
        try {
            return this.first();
        } catch (e) {
            if (e instanceof Empty) {
                return value;
            } else {
                throw e;
            }
        }
    }

    last() { return last(this.#iter); }
    last_or() {
        try {
            return this.last();
        } catch (e) {
            if (e instanceof Empty) {
                return value;
            } else {
                throw e;
            }
        }
    }

    // "Finishing" methods, that returns a singular value

    /*
     * reduce()
     *   The ubiquitous reduce. Arguments are like those for Array.reduce.
     */
    reduce(fn, start_value) { return reduce(this.#iter, fn, start_value); }

    /*
     * average(), avg()
     * Return the average of the purely numerical values of the iterator.
     * Non-numerical values (including booleans) are ignored.
     * Throws Empty if the iteration yields no values.
     * The ..._or(value) variants will return value instead of throwing Empty
     * if the iteration yields no values.
     */
    average() { return average(this.#iter); }
    avg() { return this.average(); }
    sum() { return sum(this); }
    sum_or(value) { return sum_or(this, value); }

    average_or(value) { return _catch_empty(this.average, value); }
    avg_or(value) { return _catch_empty(this.average, value); }

    collect_array() { return Array.from(this); }
    collect_set() { return new Set(this); }

    // For use like: range(10).collect_into(SaneSet);
    // TODO untested
    collect_into(cls) { return new cls(this); }

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

export function _iter(obj) {
    if (obj && typeof obj.next === "function") {
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

function is_pojo(obj) {
    return !!obj && obj.constructor === Object;
}

function *object_iter(obj) {
    for (let key in obj) {
        if (Object.hasOwn(obj, key)) {
            yield [key, obj[key]];
        }
    }
}



// run  fn(...args) and return its result.
// if Empty is thrown, return value instead.
export function _catch_Empty(fn, value, ...args) {
    try {
        return fn(...args);
    } catch (e) {
        if (e instanceof Empty) {
            return value;
        } else {
            throw e;
        }
    }
}
