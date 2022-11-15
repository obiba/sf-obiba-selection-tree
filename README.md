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
- *type* MUST be either `array` (multiple selections) OR `string` (single selection) and is REQUIRED.
- *format* MUST be `obibaSelectionTree` and is REQUIRED.
- *items* MUST be `{ "type": "string" }` and is REQUIRED.
- *nodes* is the array of objects that will be rendered and is REQUIRED.
- *description* or *helpvalue* to display a help text.

form
- *noFilter* is `Boolean` and omitting it or setting it to false will enable the filter input box.
- *noExpandCollapse* is `Boolean` and omitting it or setting it to false will enable the expand/collapse all nodes buttons.
- *popup* is `Boolean` to specify that the selection tree will appear in a popup (always `true` when single selection, `false` by default otherwise).
- *selectLabel* is the text in the select button (when using popup). Default is `Select...`.
- *noSelectionLabel* is the text to display when there is no selection (when using popup). Default is `No selection`.
- *selectionsCountLabel* is the text to display when there is no selection (when using popup with `array` type). Default is `{0} selected items`.
- *selectionTipLabel* is the text to display on top left of the selection tree (when using popup).
- *expandAllLabel* is text in the "Expand all nodes" button. Default is `Expand all`.
- *collapseAllLabel* is text in the "Collapse all nodes" button. Default is `Collapse all`.
- *clearLabel* is the text in the "Clear" button. Default is `Clear`.

node
- *title* is a string
- *path* is a string and is REQUIRED. Will be used if no title is set.
- *type* is an optional string to indicate whether a node is a "file" (`f`) or a "directory" (`d`).
- *nodes* is an array of objects (a sub-tree), optional.
- *description* is a string or an array of strings (to represent multiple lines). Should work as the node's description and will be rendered with markdown.
