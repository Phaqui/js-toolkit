import { Empty } from "./util.mjs";

// Did you know that they forgot to add normal set operations when they made
// Set in javascript?
export class SaneSet extends Set {
    constructor(...args) { super(...args); }
    equals(other) { return equals(this, other); }
    is_empty() { return this.size === 0; }
    difference(other) { return difference(this, other); }
    intersection(other) { return intersection(this, other); }
    union(...others) { return union(this, ...others); }
    is_disjoint(...others) { return is_disjoint(this, ...others); }
    pop() { return pop(this); }
    pop_or(value) { return pop_or(this, value); }
    without(value, fn) { return without(this, value, fn); }
}

export function equals(a, b) {
    if (a.size !== b.size) return false;
    for (const x of a) {
        if (!b.has(x)) return false;
    }
    return true;
}

export function difference(a, b) {
    const diff = new SaneSet(a);
    for (const elem of b) {
        diff.delete(elem);
    }
    return diff;
}

export function intersection(a, ...others) {
    const only_samesies = new SaneSet();
    outer: for (const elem of a) {
        for (const other of others) {
            if (!other.has(elem)) continue outer;
        }

        only_samesies.add(elem);
    }
    return only_samesies;
}

export function union(a, ...others) {
    const everything = new SaneSet(a);
    for (const other of others) {
        for (const elem of other) {
            everything.add(elem);
        }
    }
    return everything;
}

export function is_disjoint(a, ...others) {
    return intersection(a, ...others).is_empty();
}

export function pop(set) {
    if (set.size === 0)
        throw new Empty("Cannot pop from empty set");
    const array = [...set];
    const random_index = Math.floor(Math.random() * set.size);
    const chosen = array[random_index];
    set.delete(chosen);
    return chosen;
}

export function pop_or(set, value) {
    try {
        return pop(set);
    } catch (e) {
        if (e instanceof Empty) {
            return value;
        } else {
            throw e;
        }
    }
}

export function without(set, value, fn) {
    let did_take_away = false;
    if (set.has(value)) {
        set.delete(value);
        did_take_away = true;
    }
    const result = fn(set);
    if (did_take_away) set.add(value);
    return result;
}
