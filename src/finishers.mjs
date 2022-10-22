import { _iter } from "./iter.mjs";
import { truthy, Empty, _catch_empty, _num } from "./util.mjs";

export function any(obj, pred = truthy) {
    const it = _iter(obj);
    for (const val of it) {
        if (pred(val)) return true;
    }
    return false;
}

export function all(obj, pred = truthy) {
    const it = _iter(obj);
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

    return _first(_iter(obj));
}

export function last(obj) {
    if (Array.isArray(obj)) {
        if (obj.length === 0) throw new Empty();
        return obj[obj.length - 1];
    }

    return _last(_iter(obj));
}

export const first_or = (obj, value) => _catch_empty(_first, value, obj);
export const last_or = (obj, value) => _catch_empty(_last, value, obj);
export const average_or = (obj, value) => _catch_empty(average, value, obj);
export const sum_or = (obj, value) => _catch_empty(sum, value, obj);

export function _first(it) {
    const next = it.next();
    if (next.done) throw new Empty();
    return next.value;
}

export function _last(it) {
    let value;
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

export function average(obj) {
    const it = _iter(obj);
    let n = 0, sum = 0;
    for (const curr of it) {
        const number = _num(curr);
        if (Number.isNaN(number)) continue;
        sum += number;
        n++;
    }
    if (n === 0) throw new Empty();
    return sum / n;
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

