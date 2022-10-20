// The default Set doesn't define normal set operations... javascript... wut
export default class SaneSet extends Set {
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
        const alleskalmed = new SaneSet(this);
        for (const ss of others) {
            for (const elem of other) {
                alleskalmed.add(elem);
            }
        }
        return alleskalmed;
    }

    is_disjoint(...others) {
        // ...
    }
}
