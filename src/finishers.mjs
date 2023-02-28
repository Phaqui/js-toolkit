import { _iter } from "./iter.mjs";
import { truthy, Empty, _catch_empty, _num, __none } from "./util.mjs";

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

export function count(obj) {
    if (Array.isArray(obj)) return obj.length;
    if (obj instanceof Set) return obj.size;
    let n = 0, it = _iter(obj);
    for (const _ of it) n++;
    return n;
}

export function join(obj, str = "") {
    return [..._iter(obj)].join(str);
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

export function min(obj) {
    if (Array.isArray(obj)) {
        if (obj.length === 0) throw new Empty();
        // slow? max number of elements?
        // what happens to non-number (or NaN) elements?
        return Math.min(...obj);
    }

    return _min(obj);
}

export const first_or = (obj, value) => _catch_empty(_first, value, obj);
export const last_or = (obj, value) => _catch_empty(_last, value, obj);
export const average_or = (obj, value) => _catch_empty(average, value, obj);
export const median_or = (obj, value) => _catch_empty(median, value, obj);
export const sum_or = (obj, value) => _catch_empty(sum, value, obj);
export const min_or = (obj, value) => _catch_empty(min, value, obj);
export const reduce_or = (obj, value, fn, initial_value = __none) =>
    _catch_empty(reduce, value, obj, fn, initial_value);

export function _first(obj) {
    const it = _iter(obj);
    const next = it.next();
    if (next.done) throw new Empty();
    return next.value;
}

export function _last(obj) {
    const it = _iter(obj);
    let value;
    let it_res = it.next();
    if (it_res.done) throw new Empty();
    while (!it_res.done) {
        value = it_res.value;
        it_res = it.next();
    }
    return value;
}

export function reduce(obj, fn, initial_value = __none) {
    const it = _iter(obj);
    let curr, prev, i = 0;

    if (initial_value === __none) {
        const first = it.next();
        if (first.done) {
            throw new Empty();
        } else {
            prev = first.value;
        }
    } else {
        prev = initial_value;
    }

    const next = it.next();
    if (next.done) {
        return prev;
    }
    curr = next.value;
    curr = fn(prev, curr, i++);

    while (true) {
        const next = it.next();
        if (next.done) break;
        prev = curr;
        curr = next.value;
        curr = fn(prev, curr, i++);
    }

    return curr;
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

const sort_numerically = (a, b) => a - b;
export function median(obj, { sort_func = sort_numerically } = {}) {
    const items = [..._iter(obj)].sort(sort_numerically);
    const len = items.length;

    if (len === 0) throw new Empty();

    if (len % 2 === 1) {
        const middle = (len - 1) / 2;
        return items[middle];
    } else {
        const middle_1 = len / 2 - 1;
        const middle_2 = len / 2;
        return (items[middle_1] + items[middle_2]) / 2;
    }
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

export function _min(obj) {
    let it = _iter(obj);
    let first = it.next();
    if (first.done) throw new Empty();
    let winner = first.value;
    for (let current of it) {
        if (current < winner) {
            winner = current;
        }
    }
    return winner;
}

