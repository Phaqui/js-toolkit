import t from "tap";

t.test("s", { autoend: true }, t => {
    const s = "this is a string";

    const splits = [...split(s, " ")];
});
