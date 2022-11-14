import { Empty } from "./util.mjs";

/*
 * An extention of Map that has setdefault() and entry().
 * entry(key) returns an Entry object, with methods or_default, and and_modify()
 */
export class BetterMap extends Map {
    constructor(...args) { super(...args); }
    setdefault(key, def = undefined) { return setdefault(map, key, def); }
    entry(key) { return new Entry(this, key); }
}

export function setdefault(map, key, def = undefined) {
    if (map.has(key)) {
        return map.get(key);
    } else {
        map.set(key, def);
        return def;
    }
}

/*
 * Calling `bettermap.entry(key)` returns this type.
 * It has methods:
 *   or_insert(value) - IFF the map did _not_ have the given `key`, insert `value`
 *       under `key`. If however the map _did_ have `key`, do nothing.
 *   and_modify(fn) - IFF the map _did_ have `key`, call `fn` with the associated
 *       value, and set the map's key to be the result of that call.
 *       If however the map did _not_ have that key, then do nothing.
 */
class Entry {
    constructor(map, key) {
        this.map = map;
        this.key = key;
        this.value = map.has(key) ? map.get(key) : Empty;
    }

    or_insert(value) {
        if (this.value === Empty) {
            this.value = value;
            this.map.set(this.key, value);
        }
        return this;
    }

    and_modify(fn) {
        if (this.value !== Empty) {
            this.value = fn(this.value);
            this.map.set(this.key, this.value);
        }
        return this;
    }
}




function test(expected, actual) {
    const ok = expected === actual;
    const op = ok ? "===" : "!==";
    const msg = ok ? "    OK" : "NOT OK";
    console.log(`${msg}: ${expected} ${op} ${actual}`);
}

function all_tests() {
    const m = new BetterMap();
    // get entry of "A", which is empty, so insert 0, then modify that 0 to be 1
    m.entry("A").or_insert(0).and_modify(x => x + 1);
    test(1, m.get("A"));


    // get entry of "B", and modify it if it's there (but it isn't), or insert 0
    // if it isn't there, so insert 0
    m.entry("B").and_modify(x => x + 1).or_insert(0);
    test(0, m.get("B"));

    // get entry of "C", and modify it to set it to 0 if it's there, otherwise
    // don't do anything. we expect the map not to have a "C" key.
    m.entry("C").and_modify(x => 0);
    test(false, m.has("C"));


    // first set m["D"] = 2, then get the entry of "D", and modify it to be 4
    m.set("D", 2);
    m.entry("D").and_modify(x => x * 2);
    test(4, m.get("D"));

    // set m["E"] = 2, but modify it to just be -1
    m.set("E", 2);
    m.entry("E").and_modify(_ => -1);
    test(-1, m.get("E"));
}
//all_tests();
