import { truthy, Empty, _catch_empty, _num } from "./util.mjs";
import {
    zip
} from "./producers.mjs";
import {
    average,
    average_or,
    first,
    first_or,
    last,
    last_or,
    reduce,
    sum,
    sum_or
} from "./finishers.mjs";

import {
    _map,
    _take,
    _filter
} from "./processors.mjs";

export function iter(obj) {
    return new Iter(obj);
}

class Iter {
    #iter;

    constructor(obj) {
        this.#iter = _iter(obj);
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
    intersperse(value) { this.#iter = _intersperse(this.#iter, value); return this; }

    all(pred = truthy) { return all(this.#iter, pred); }
    any(pred = truthy) { return any(this.#iter, pred); }
    first() { return first(this.#iter); }
    first_or(value) { return first_or(this.#iter); }
    last() { return last(this.#iter); }
    last_or(value) { return last_or(this.#iter, value); }
    reduce(fn, start_value) { return reduce(this.#iter, fn, start_value); }
    average() { return average(this.#iter); }
    avg() { return average(this.#iter); }
    average_or(value) { return average_or(this.#iter, value); }
    avg_or(value) { return average_or(this.#iter, value); }
    sum() { return sum(this); }
    sum_or(value) { return sum_or(this, value); }

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
    if (typeof obj === "undefined") {
        throw new TypeError("iter(): undefined is not iterable");
    }
    if (obj === null) {
        throw new TypeError("iter(): null is not iterable");
    }
    if (typeof obj === "boolean") {
        throw new TypeError("iter(): boolean is not iterable");
    }

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

