export function type(obj) {
    if (obj === null) return "null";
    if (obj === undefined) return "undefined";
    return obj.constructor.name;
}

//export const type = obj => obj?.constructor?.name ??
//    (obj === null ? "null" : "undefined");
