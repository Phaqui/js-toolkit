// Did you know that they forgot to add normal set operations when they made
// Set in javascript?
export class SaneSet extends Set {
    constructor(...args) {
        super(...args);
    }

    is_empty() { return this.size === 0; }

    difference(other) {
        const diff = new SaneSet(this);
        for (const elem of other) {
            diff.delete(elem);
        }
        return diff;
    }

    intersection(other) {
        const only_samesies = new SaneSet();
        for (const elem of other) {
            if (this.has(elem)) {
                only_samesies.add(elem);
            }
        }
        return only_samesies;
    }

    union(...others) {
        const everything = new SaneSet(this);
        for (const other of others) {
            for (const elem of other) {
                everything.add(elem);
            }
        }
        return everything;
    }

    is_disjoint(...others) {
        // ...
    }
}
