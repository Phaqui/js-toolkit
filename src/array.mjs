// https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
export function shuffle(array) {
    let j, x, i;
    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
}

export function patch_array_shuffle() {
    Object.defineProperty(Array.prototype, "shuffle", {
        value: function () { return shuffle(this); },
    });
} 
