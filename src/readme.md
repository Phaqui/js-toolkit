Source code explanation, structure and organization

## iter()

The **iter()** entry point, as well as other *producers*, will
return a new instance of the Iter class (defined in iter.mjs).
It has a private field *#iter*, which is the actual iterator.
