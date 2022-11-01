// Sieve of Eratosthenes
// Code by David Eppstein, UC Irvine, 28 Feb 2002
// http://code.activestate.com/recipes/117119/
// transliterated from original Python to Javascript by Anders Lorentsen

export function *_sieve_of_eratosthenes() {
    const D = new Map();
    let q = 2;
    while (true) {
        if (!D.has(q)) {
            yield q;
            D.set(q * q, [q])
        } else {
            for (let p of D.get(q)) {
                let t = p + q;
                if (D.has(t)) {
                    D.get(t).push(p);
                } else {
                    D.set(t, [p]);
                }
            }
            D.delete(q);
        }
        q += 1;
    }
}
