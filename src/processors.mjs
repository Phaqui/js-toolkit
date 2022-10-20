export function filter(obj, fn) {
    // hmm
}

export function map(iterable, fn) {
    // hmm
}


export function *_filter(iterable, fn) {
    for (let val of iterable) {
        if (fn(val)) yield val;
    }
}

export function *_map(iterable, fn) {
    for (let val of iterable) {
        yield fn(val);
    }
}

export function *_take(iterable, n) {
    for (const val of iterable) {
        yield val;
        if (!--n) break;
    }
}

export function *_takewhile(iterable, pred) {
    for (const val of iterable) {
        if (!pred(val)) break;
        yield val;
    }
}

export function *_takeuntil(iterable, pred) {
    for (const val of iterable) {
        if (pred(val)) break;
        yield val;
    }
}

export function *_skip(iterable, n = 1) {
    while (n--) iterable.next();
    for (const val of iterable) {
        yield val;
    }
}
