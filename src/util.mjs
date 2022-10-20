export const truthy = x => !!x;
export const falsy = x => !x;

export class Empty extends Error {
    constructor(...params) {
        super(...params);
        this.name = "Empty";
    }
}

export function average(xs) {
    let n = 0, sum = 0;
    for (const curr of xs) {
        const number = _num(curr);
        if (Number.isNaN(number)) continue;
        sum += number;
        n++;
    }
    if (n === 0) throw new Empty();
    return sum / n;
}

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

