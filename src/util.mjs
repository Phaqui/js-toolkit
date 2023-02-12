export const truthy = x => !!x;
export const falsy = x => !x;

export function type(obj) {
    if (obj === null) return "null";
    if (obj === undefined) return "undefined";
    return obj.constructor.name;
}

export function is_iterable(obj) {
    if (obj === undefined || obj === undefined) return false;
    return typeof obj[Symbol.iterator] === "function";
}

export class Empty extends Error {
    constructor(...params) {
        super(...params);
        this.name = "Empty";
    }
}

export const _default = Symbol("_default");
export const __none = Symbol("None");
export const __need_more_values = Symbol("need more values");

export function _num(obj) {
    if (Array.isArray(obj)) {
        // did you know Number([]) === 0 in js?
        // did you know Number([x]) === x in js? (where x is a number)
        return Number.NaN;
    }
    if (obj === null) {
        // did you know Number(null) === 0 in js?
        // (as a curiosity, Number() is 0, yet Number(undefined) is NaN)
        return Number.NaN;
    }
    if (typeof obj === "boolean") {
        // Number(False) is 0 and Number(True) is 1, that's actually okay,
        // but for our purposes, we don't want that.
        return Number.NaN;
    }
    return Number(obj);
}

// run  fn(...args) and return its result.
// if Empty is thrown, return value instead.
export function _catch_empty(fn, value, ...args) {
    try {
        return fn(...args);
    } catch (e) {
        if (e instanceof Empty) {
            return value;
        } else {
            throw e;
        }
    }
}
