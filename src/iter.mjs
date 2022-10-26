import { truthy, Empty, _catch_empty, _num } from "./util.mjs";
import {
    zip,
    _intersperse,
} from "./producers.mjs";
import {
    average,
    average_or,
    first,
    first_or,
    last,
    last_or,
    join,
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
    group(fn) {
        const g = new Group(fn, this);
        this.#iter = g[Symbol.iterator](this.#iter);
        return g
    }
    __start_groups(groups) {
        this.#iter = groups.__iter(this.#iter);
    }
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
    join(str) { return join(this.#iter, str); }
    reduce(fn, start_value) { return reduce(this.#iter, fn, start_value); }
    average() { return average(this.#iter); }
    avg() { return average(this.#iter); }
    average_or(value) { return average_or(this.#iter, value); }
    avg_or(value) { return average_or(this.#iter, value); }
    sum() { return sum(this); }
    sum_or(value) { return sum_or(this, value); }

    collect_array() { return Array.from(this); }
    collect_set() { return new Set(this); }
    collect_map() { return new Map(this); }
    //collect_object() { return Object.fromEntries(it); }

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

export const _else = Symbol("_else");

const __not_set = Symbol();
class Group {
    constructor(discriminator_fn, iter_object) {
        this.iter_object = iter_object;
        this.discriminator_fn = discriminator_fn;
        this.groups = new Map();
        this.current_group = __not_set;
    }

    *[Symbol.iterator](it) {
        // it == the input from above
        while (true) {
            const next_from_above = it.next();
            if (next_from_above.done) {
                for (const [match_arm, match_group] of this.groups) {
                    if (match_group.finisher) {
                        const final_result = match_group.finish();
                        if (match_arm === _else) {
                            yield ["__default", final_result];
                        } else {
                            yield [match_arm, final_result];
                        }
                    }
                }
                break;
            } else {
                const next_value_from_above = next_from_above.value;
                const match_arm = this.discriminator_fn(next_value_from_above);
                let match_group = this.groups.get(match_arm);
                if (match_group === undefined) {
                    match_group = this.groups.get(_else);
                    if (match_group === undefined) {
                        // match arm not set, and no else group, what do we do?
                    } else {
                        // no matching arm for the value, but we have an _else
                        // group, so it will be used as usual, below.
                    }
                }

                match_group.initial_generator.feed(next_value_from_above);
                const next_result_from_match_arm = match_group.iter.next();

                if (match_group.finisher) {
                    match_group.push_value(next_result_from_match_arm.value);
                }
            }
        }

    }

    map(fn) {
        if (this.current_group === undefined) {
            throw Error("Not in match arm");
        }
        const match_group = this.groups.get(this.current_group);
        match_group.iter = _map(match_group.iter, fn);
        return this;
    }

    sum() {
        let match_group = this.groups.get(this.current_group);
        match_group.finisher = sum;
        return this;
    }

    match(arg) {
        this.current_group = arg;
        const initial_generator = make_iterator();
        const match_group = new MatchGroup(arg, initial_generator);
        this.groups.set(this.current_group, match_group);
        console.log(this.groups);
        return this;
    }

    // Wait for every arm's iterator to have terminated
    // and resulted in a value, then iterate over
    // the results
    gather() {
        if (this.current_group === __not_set) {
            throw new Error("No match arms given");
        }
        return this.iter_object;
    }
}

function make_iterator() {
    let done = false;
    const q = [];
    return {
        complete() { done = true; },
        next() {
            const value = q.pop();
            return { value, done };
        },
        [Symbol.iterator]() { return this; },
        feed(value) {
            q.push(value);
        }
    };
}

class MatchGroup {
    #values;
    constructor(match_val, initial_generator) {
        this.match_val = match_val;
        this.initial_generator = initial_generator;
        this.iter = _iter(initial_generator);
        this.finisher = null;
        this.#values = [];
    }
    push_value(value) {
        this.#values.push(value);
    }
    finish() {
        return this.finisher(this.#values);
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

