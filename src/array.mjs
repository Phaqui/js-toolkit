import { fisher_yates } from "./fisher_yates.mjs";
import { sattolo_cycle } from "./sattolo_cycle.mjs";

export function shuffle(array) {
    return fisher_yates(array);
}

export function sattolo_shuffle(array) {
    return sattolo_cycle(array);
}

export function patch_array_shuffle() {
    Object.defineProperty(Array.prototype, "shuffle", {
        value: function () { return shuffle(this); },
    });
} 
