// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Sattolo's_algorithm 
export function sattolo_cycle(array) {
    let j, x, i = array.length;
    while (i > 1) {
        i--;
        j = Math.floor(Math.random() * i);
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
}
