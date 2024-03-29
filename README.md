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

form
- *noFilter* is `Boolean` and omitting it or setting it to false will enable the filter input box.
- *noExpandCollapse* is `Boolean` and omitting it or setting it to false will enable the expand/collapse all nodes buttons.
- *popup* is `Boolean` to specify that the selection tree will appear in a popup (always `true` when single selection, `false` by default otherwise).
- *closeLabel* is the text in the popup close button (top right corner, when in read mode). Default is empty (icon is used instead).
- *cancelLabel* is the text in the popup cancel button (top right corner, when in edit mode). Default is `Cancel`.
- *saveLabel* is the text in the popup save button (top right corner, when in edit mode). Default is `Save`.
- *selectLabel* is the text in the select button (when using popup). Default is `Select...`.
- *showDetailsLabel* is the text in the show button (when using popup and form is read-only). Default is `Show details...`.
- *noSelectionLabel* is the text to display when there is no selection (when using popup). Default is `No selection`.
- *selectionsCountLabel* is the text to display when there is no selection (when using popup with `array` type). Default is `{0} selected items`.
- *selectionTipLabel* is the text to display on top left of the selection tree (when using popup).
- *expandAllLabel* is text in the "Expand all nodes" button. Default is `Expand all`.
- *collapseAllLabel* is text in the "Collapse all nodes" button. Default is `Collapse all`.
- *clearLabel* is the text in the "Clear" button. Default is `Clear`.
- *downloadLabel* is the text in the "Download" button (when form is read-only) that triggers download of the selected/all nodes in CSV format. Default is `Download`. If `false`, downloading selections is not available.
- *downloadAll* is `Boolean` to specify whether downloaded CSV file should include both selected and not selected nodes, with a `selected` column. Default is `false`.
- *description* or *helpvalue* to display a help text.
- *descriptionPanelClass* is the CSS class of the panel containing the item descriptions (complement of *nodeDescribedNodesPanelClass*). Default is `col-6 col-xs-6`.
- *nodeDescribedNodesPanelClass* is the CSS class of the panel containing the nodes when a node description is displayed (complement of *descriptionPanelClass*). Default is `col-6 col-xs-6`.

node
- *title* is a string
- *path* is a string and is REQUIRED. Will be used if no title is set.
- *type* is an optional string to indicate whether a node is a "file" (`f`) or a "directory" (`d`).
- *nodes* is an array of objects (a sub-tree), optional.
- *description* is a string or an array of strings (to represent multiple lines). Should work as the node's description and will be rendered with markdown.
