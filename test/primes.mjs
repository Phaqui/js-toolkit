import t from "tap";
import { primes } from "../src/primes.mjs";

const known_first_primes = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41,
    43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97
];

t.test("primes()", { autoend: true }, t => {
    t.test("correct", { autoend: true }, t => {
        t.strictSame(
            known_first_primes,
            primes().take(known_first_primes.length).collect_array(),
            "bleh"
        );
    });
});
