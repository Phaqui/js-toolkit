import { truthy, Empty, _catch_empty, _num } from "./util.mjs";
import {
    zip,
    _intersperse,
} from "./producers.mjs";
import {
    all,
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
    takewhile(pred) { this.#iter = _takewhile(this.#iter, pred); return this; }
    takeuntil(pred) { this.#iter = _takeuntil(this.#iter, pred); return this; }
    chain(iterable) { this.#iter = chain(this.#iter, iterable); return this; }
    zip(...iterables) { this.#iter = zip(this.#iter, ...iterables); return this;}
    intersperse(value) { this.#iter = _intersperse(this.#iter, value); return this; }

    all(pred = truthy) { return all(this.#iter, pred); }
    any(pred = truthy) { return any(this.#iter, pred); }
    average() { return average(this.#iter); }
    avg() { return average(this.#iter); }
    average_or(value) { return average_or(this.#iter, value); }
    avg_or(value) { return average_or(this.#iter, value); }
    first() { return first(this.#iter); }
    first_or(value) { return first_or(this.#iter, value); }
    last() { return last(this.#iter); }
    last_or(value) { return last_or(this.#iter, value); }
    join(str) { return join(this.#iter, str); }
    reduce(fn, start_value) { return reduce(this.#iter, fn, start_value); }
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
const __items = Symbol("__items");

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
                const items = next_result_from_match_arm.value[__items];
                if (next_result_from_match_arm.done) {
                    // don't do anything -- or potentially call the finisher?
                } else {
                    if (match_group.finisher) {
                        for (const item of items) {
                            match_group.push_value(item);
                        }
                    } else {
                        for (const item of items) {
                            yield [match_group.match_val, item];
                        }
                    }
                }
            }
        }
    }

    // Set up a match arm for some value
    match(value) {
        this.current_group = value;
        const initial_generator = make_iterator();
        const match_group = new MatchGroup(value, initial_generator);
        this.groups.set(this.current_group, match_group);
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

    #get_current_match_group() {
        if (this.current_group === __not_set) throw Error("not in match arm");
        return this.groups.get(this.current_group);
    }

    #wrap_current_matchgroup_iter(fn, ...args) {
        if (this.current_group === __not_set) throw Error("not in match arm");
        const mg = this.groups.get(this.current_group);
        mg.iter = fn(mg.iter, ...args);
        return this;
    }

    // Sets the finisher of the current match arm
    #set_finisher(fn) {
        if (this.current_group === __not_set) throw Error("not in match arm");
        const mg = this.groups.get(this.current_group);
        mg.finisher = fn;
        return this;
    }


    filter(fn) { return this.#wrap_current_matchgroup_iter(__filter, fn); }
    map(fn) { return this.#wrap_current_matchgroup_iter(_map, fn); }
    chain(iterable) { return this.#wrap_current_matchgroup_iter(chain, iterable); }
    take(n) { return this.#wrap_current_matchgroup_iter(_take, n); }
    takewhile(pred) { return this.#wrap_current_matchgroup_iter(_takewhile, pred);}
    takeuntil(pred) { return this.#wrap_current_matchgroup_iter(_takeuntil, pred);}
    intersperse(value) {
        return this.#wrap_current_matchgroup_iter(__intersperse, value);
    }
    zip(...iterables) {
        return this.#wrap_current_matchgroup_iter(zip, ...iterables);
    }

    all(pred = truthy) { return this.#set_finisher(it => all(it, pred)); }
    any(pred = truthy) { return this.#set_finisher(it => any(it, pred)); }
    first() { return this.#set_finisher(first); }
    first_or(value) { return this.#set_finisher(it => first_or(it, value)); }
    last() { return this.#set_finisher(last); }
    last_or(value) { return this.#set_finisher(it => last_or(it, value)); }
    join(str) { return this.#set_finisher(it => join(it, str)); }
    reduce(fn, start_value) {
        return this.#set_finisher(it => reduce(it, fn, start_value));
    }
    average() { return this.#set_finisher(average); }
    avg() { return this.#set_finisher(average); }
    average_or(value) { return this.#set_finisher(it => average_or(it, value)); }
    avg_or(value) { return this.#set_finisher(it => average_or(it, value)); }
    sum() { return this.#set_finisher(sum); }
    sum_or(value) { return this.#set_finisher(it => sum_or(it, value)); }

    collect_array() { return this.#set_finisher(it => Array.from(it)); }
    collect_map() { return this.#set_finisher(it => new Map(it)); }
    collect_set() { return this.#set_finisher(it => new Set(it)); }
    collect_into(cls) { return this.#set_finisher(it => new cls(it)); }
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

function *__filter(it, fn) {
    while (true) {
        let { done, value } = it.next();
        value = items_of(value);
        if (done) return;
        const keep = fn(value);
        const items = keep ? [value] : [];
        const result = { [__items]: items };
        yield result;
    }
}

function items_of(obj) {
    if (obj[__items]) {
        console.log("extracting...");
        const res = obj[__items];
        return res;
    } else {
        console.log("clean:", obj);
        return obj;
    }
}

function *__intersperse(it, value) {
    let first, rest;
    while (true) {
        let a = it.next();
        if (a.done) return;
        [first, ...rest] = items_of(a.value);
        if (first !== undefined) break;
    }

    yield { [__items]: [first] };
    let b = it.next();
    if (b.done) return;
    yield { [__items]: [value, b.value] };
    while (true) {
        a = it.next();
        if (a.done) break;
        yield { [__items]: [value, a.value] };
    }
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

