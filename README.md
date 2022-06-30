# SF-OBIBA-SELECTION-TREE

### to build
(using [nvm](https://github.com/nvm-sh/nvm))

```
nvm i lts/gallium
npm i -g bower gulp
npm i
bower install
gulp
```

### important
schema
- *title* is a string.
- *type* MUST be `array` and is REQUIRED.
- *format* MUST be `obibaSelectionTree` and is REQUIRED.
- *noFilter* is `Boolean` and omitting it or setting it to false will enable the filter input box.
- *items* MUST be `{ "type": "string" }` and is REQUIRED.
- *nodes* is the array of objects that will be rendered and is REQUIRED.

node
- *title* is a string
- *path* is a string and is REQUIRED. Will be used if no title is set.
- *type* is a string (either `f` or `d` for "leaf" and "branch" respectively. If omitted, will be treated as `f`.).
- *nodes* is an array of objects (a sub-tree).
- *attributes* is an array of objects. Should work as description and will be rendered with markdown.

attribute
- *title* first item to be rendered. Can be left blank.
- *body*
