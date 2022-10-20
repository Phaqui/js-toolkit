import { IteratorMap } from "./zip.mjs";

export function iter(obj) {
    return new Iter(obj);
}

function *object_iter(obj) {
    for (let key in obj) {
        if (Object.hasOwn(obj, key)) {
            yield [key, obj[key]];
        }
    }
}

class Iter {
    constructor(obj) {
        this.it = _iter(obj);
    }

    *[Symbol.iterator]() {
        for (const val of this.it) {
            yield val;
        }
    }

    map(fn) { return new IteratorMap(this, fn); }
}

function _iter(obj) {
    if (typeof obj.next === "function") {
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
