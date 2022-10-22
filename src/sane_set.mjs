// Did you know that they forgot to add normal set operations when they made
// Set in javascript?
export class SaneSet extends Set {
    constructor(...args) { super(...args); }
    is_empty() { return this.size === 0; }
    difference(other) { return difference(this, other); }
    intersection(other) { return intersection(this, other); }
    union(...others) { return union(this, ...others); }
    is_disjoint(...others) { return is_disjoint(this, ...others); }
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
