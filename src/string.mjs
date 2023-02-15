export function trim(str, trim_characters = " \t\n") {
    if (typeof str !== "string") {
        throw new TypeError("trim(): argument 1 (str) must be a string");
    }
    if (typeof trim_characters !== "string") {
        throw new TypeError("trim(): argument 2 (trim_characters) must be a string");
    }
    trim_characters = new Set(trim_characters);

    let start = -1;
    let end = str.length;

    while (trim_characters.has(str[++start])) ;
    while (trim_characters.has(str[--end])) ;

    return str.slice(start, end + 1);
}
