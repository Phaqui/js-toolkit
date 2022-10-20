import { _iter } from "./iter.mjs";
import { truthy, Empty } from "./util.mjs";

export function any(iterable, pred = truthy) {
    const it = _iter(iterable);
    for (const val of it) {
        if (pred(val)) return true;
    }
    return false;
}

export function all(iterable, pred = truthy) {
    const it = _iter(iterable);
    for (const val of it) {
        if (!pred(val)) return false;
    }
    return true;
}

export function first(obj) {
    if (Array.isArray(obj)) {
        if (obj.length === 0) throw new Empty();
        return obj[0];
    }

    const it = _iter(obj);
    const next = it.next();
    if (next.done) throw new Empty();
    return next.value;
}

export function last(obj) {
    // if given an actual array, there's no need to grab an iterator of it,
    // iterate through the end, then return the last item, we have random access.
    if (Array.isArray(obj)) {
        if (obj.length === 0) throw new Empty();
        return obj[obj.length - 1];
    }

    let value;
    const it = _iter(obj);
    let it_res = it.next();
    if (it_res.done) throw new Empty();
    while (!it_res.done) {
        value = it_res.value;
        it_res = it.next();
    }
    return value;
}

export function reduce(obj, fn, start_value, XXX) {
    let it = _iter(obj);

    let result, prev;
    if (typeof start_value === "undefined") {
        prev = it.next().value;
    } else {
        prev = start_value;
    }

    for (const curr of it) {
        result = fn(prev, curr);
        prev = result;
    }

    return result;
}

export function sum(obj) {
    let it = _iter(obj);
    let result = 0;
    let n = 0;
    for (let curr of it) {
        n++;
        result += curr;
    }
    if (n === 0) throw new Empty();
    return result;
}

import { _catch_Empty } from "./iter.mjs";
export function sum_or(obj, value) {
    return _catch_Empty(sum, value, obj);
}
