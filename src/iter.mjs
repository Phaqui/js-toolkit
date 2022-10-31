import {
    truthy,
    Empty,
    _catch_empty,
    _num,
    __none,
    __need_more_values,
} from "./util.mjs";

import {
    chain,
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
    //reduce,
    sum,
    sum_or
} from "./finishers.mjs";

import {
    _map,
    _take,
    _filter
} from "./processors.mjs";

export const _else = Symbol("_else");
export const __stop = Symbol("__stop");
export function iter(obj) { return new Iter(obj); }

class Iter {
    #it;
    #chain = [];

    constructor(obj) {
        this.#it = _iter(obj);
    }

    *[Symbol.iterator]() {
        let running = true;
        all_done: while (running) {
            let values = [];
            outer: while (true) {
                const next = this.#it.next();
                if (next.done) break all_done;
                values = values.filter(remove_needmorevals);
                values.push(next.value);
                for (const fn of this.#chain) {
                    values = values.map(fn).filter(remove_none).flat();
                    if (values.includes(__stop)) {
                        running = false;
                        values = values.filter(x => x !== __stop);
                        break outer;
                    }
                    if (values.includes(__need_more_values)) {
                        continue outer;
                    }
                    if (values.length === 0) break outer;
                }
                break outer;
            }
            for (const res of values) { yield res; }
        }
    }

    // processors
    
    filter(fn) { this.#chain.push(filter.bind(null, fn)); return this; }
    map(fn) { this.#chain.push(map.bind(null, fn)); return this; }
    intersperse(value) {
        this.#chain.push(_make_intersperse(value)); return this; }
    pairwise() { this.#chain.push(_make_pairwise()); return this; }
    take(n) { this.#chain.push(_make_take(n)); return this; }
    group(fn) { }
    takewhile(pred) { this.#chain.push(_make_takewhile(pred)); return this; }
    takeuntil(pred) {}
    chain(iterable) { return chain(this, iterable); }
    zip(...iterables) {}

    // finishers

    all(pred = truthy) { return all(this, pred); }
    any(pred = truthy) { return any(this, pred); }
    average() { return average(this); }
    avg() { return average(this); }
    average_or(value) { return average_or(this, value); }
    avg_or(value) { return average_or(this, value); }
    join(str) { return join(this, str); }
    sum() { return sum(this); }
    sum_or(value) { return sum_or(this, value); }
    first() { return first(this); }
    first_or(value) { return first_or(this, value); }
    last() { return last(this); }
    last_or(value) { return last_or(this, value); }
    reduce(fn, initial_value = __none) { return reduce(this, fn, initial_value); }
    reduce_or(value, fn, initial_value = __none) {
        return reduce_or(this, value, fn, initial_value);
    }

    collect_array() { return Array.from(this); }
    collect_set() { return new Set(this); }
    collect_into(cls) { return new cls(this); }
    collect_map() { return new Map(to_entries(this)); }
    collect_object() { return Object.fromEntries(to_entries(this)); }
}


/*
const __items = Symbol("__items");
class Group {
    constructor(discriminator_fn, iter_object) {
        this.iter_object = iter_object;
        this.discriminator_fn = discriminator_fn;
        this.groups = new Map();
        this.current_group = __none;
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
        if (this.current_group === __none) {
            throw new Error("No match arms given");
        }
        return this.iter_object;
    }

    #get_current_match_group() {
        if (this.current_group === __none) throw Error("not in match arm");
        return this.groups.get(this.current_group);
    }

    #wrap_current_matchgroup_iter(fn, ...args) {
        if (this.current_group === __none) throw Error("not in match arm");
        const mg = this.groups.get(this.current_group);
        mg.iter = fn(mg.iter, ...args);
        return this;
    }

    // Sets the finisher of the current match arm
    #set_finisher(fn) {
        if (this.current_group === __none) throw Error("not in match arm");
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
*/

const TO_ENTRIES_ERR = "to_entries(): elements of iterable must be an object, or array of length 2";
function *to_entries(iterable) {
    for (const value of iterable) {
        if (Array.isArray(value)) {
            switch (value.length) {
                case 0:
                case 1:
                default: throw new TypeError(TO_ENTRIES_ERR);
                case 2: yield value;
            }
        } else if (is_pojo(value)) {
            for (const [key, value] of Object.entries(value)) {
                yield [key, value];
            }
        } else {
            throw new TypeError(TO_ENTRIES_ERR);
        }
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

/*
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
*/

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






// ===============
function remove_none(x) { return x !== __none; }
function remove_needmorevals(x) { return x !== __need_more_values; }
function filter(fn, value) { return fn(value) ? value : __none; }
function map(fn, value) { return fn(value); }

function _make_takewhile(predicate) {
    return function takewhile(value) {
        if (predicate(value)) {
            return value;
        } else {
            return [__stop];
        }
    }
}

function _make_take(n) {
    if (typeof n !== "number" || n < 0) {
        throw new TypeError("Iter.take(n): n must be a positive number");
    }
    n++;

    return function take(value) {
        n--;
        if (n === 1) {
            return [value, __stop];
        } else if (n == 0) {
            return [__stop];
        } else {
            return value;
        }
    }
}

function _make_intersperse(interspersed_value) {
    let first = true;
    return value => first ? (first = false, value) : [interspersed_value, value];
}

function _make_pairwise() {
    let first = true;
    let x;
    return (value) => {
        //console.log(value);
        if (first) {
            first = false;
            x = value;
            return __need_more_values;
        } else {
            const result = [ [x, value] ];
            x = value;
            return result;
        }
    }
}
