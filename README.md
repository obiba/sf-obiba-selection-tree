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
- *noFilter* is `Boolean` and omitting it or setting it to false will enable the filter input box.
- *items* MUST be `{ "type": "string" }` and is REQUIRED.
- *nodes* is the array of objects that will be rendered and is REQUIRED.
- *description* or *helpvalue* to display a help text.
- *selectLabel* is the text in the select button (single selection only).
- *noSelectionLabel* is the text to display when there is no selection (single selection only).
- *selectionTipLabel* is the text to display on top left of the selection tree (single selection only).
- *noExpandCollapse* is `Boolean` and omitting it or setting it to false will enable the expand/collapse all nodes buttons.
- *expandAllLabel* is text in the "Expand all nodes" button.
- *collapseAllLabel* is text in the "Collapse all nodes" button.

node
- *title* is a string
- *path* is a string and is REQUIRED. Will be used if no title is set.
- *nodes* is an array of objects (a sub-tree), optional.
- *description* is a string or an array of strings (to represent multiple lines). Should work as the node's description and will be rendered with markdown.
