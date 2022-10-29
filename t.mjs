const __none = Symbol();
const __need_more_values = Symbol("need more values");
function remove_none(x) { return x !== __none; }
function remove_needmorevals(x) { return x !== __need_more_values; }

class Empty extends Error {}

class Iter {
    constructor(obj) {
        this.it = obj[Symbol.iterator]();
        this.chain = [];
    }

    *[Symbol.iterator]() {
        all_done: while (true) {
            let values = [];
            outer: while (true) {
                const next = this.it.next();
                if (next.done) break all_done;
                values = values.filter(remove_needmorevals);
                values.push(next.value);
                for (const { fn, fnname } of this.chain) {
                    values = values.map(fn).filter(remove_none).flat();
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

    filter(fn) {
        this.chain.push({
            fn: filter.bind(null, fn),
            fnname: "filter",
        });
        return this;
    }
    map(fn) {
        this.chain.push({
            fn: map.bind(null, fn),
            fnname: "map",
        });
        return this;
    }
    intersperse(value) {
        this.chain.push({
            fn: _make_intersperse(value),
            fnname: "intersperse",
        });
        return this;
    }
    pairwise() {
        this.chain.push({
            fn: _make_pairwise(),
            fnname: "pairwise",
        });
        return this;
    }
    collect_array() { return [...this] }
    sum() { return sum(this); }
    sum_or(value) {
        try {
            return sum(this);
        } catch (e) {
            if (e instanceof Empty) {
                return value;
            } else {
                throw e;
            }
        }
    }

    reduce(fn, initial_value = __none) {
        return reduce(this[Symbol.iterator](), fn, initial_value);
    }

    reduce_or(value, fn, initial_value = __none) {
        try {
            return reduce(this[Symbol.iterator](), fn, initial_value);
        } catch (e) {
            if (e instanceof Empty) {
                return value;
            } else {
                throw e;
            }
        }
    }
}

function iter(obj) { return new Iter(obj); }
function filter(fn, value) { return fn(value) ? value : __none; }
function map(fn, value) { return fn(value); }
function _make_intersperse(interspersed_value) {
    let first = true;
    return value => first ? (first = false, value) : [interspersed_value, value];
}
function sum(it) {
    let result = 0;
    let n = 0;
    for (let curr of it) {
        n++;
        result += curr;
    }
    if (n === 0) throw new Empty();
    return result;
}

function reduce(it, fn, initial_value = __none) {
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

