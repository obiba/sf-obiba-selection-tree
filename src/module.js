angular.module('sfObibaSelectionTree', ['schemaForm', 'sfObibaSelectionTreeTemplates', 'ngObiba'])
.config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfBuilderProvider', 'sfPathProvider',
  function (schemaFormProvider, schemaFormDecoratorsProvider, sfBuilderProvider, sfPathProvider) {

    function obibaSelectionTree(name, schema, options) {
      if (schema.type === 'array' && schema.format === 'obibaSelectionTree') {
        var f = schemaFormProvider.stdFormObj(name, schema, options);
        f.key = options.path;
        f.type = 'obibaSelectionTree';
        f.multiple = 'multiple';
        options.lookup[sfPathProvider.stringify(options.path)] = f;
        return f;
      }
    }

    schemaFormProvider.defaults.array.unshift(obibaSelectionTree);

    schemaFormDecoratorsProvider.defineAddOn('bootstrapDecorator', 'obibaSelectionTree', 'src/templates/sf-obiba-selection-tree.html', sfBuilderProvider.stdBuilders);
  }
])
.component('sfObibaSelectionTreeNode', {
  bindings: {
    node: '<',
    selections: '<',
    readonly: '<',
    parentNode: '<',
    textFilter: '<',
    onToggleChildrenSelections: '&'
  },
  templateUrl: 'src/templates/sf-obiba-selection-tree-node.html',
  controller: function () {
    const ctrl = this;

    function controllerOnChanges(changeObj) {
      if (changeObj.node && changeObj.node.currentValue && changeObj.node.currentValue.path) {
        ctrl.currentNode = changeObj.node.currentValue;
        ctrl.currentNodePath = ctrl.node.path;
        ctrl.currentNodeTitle = ctrl.node.title || ctrl.node.path;
        ctrl.isLeaf = ctrl.node && (ctrl.node.type !== 'd' && (!Array.isArray(ctrl.node.nodes) || ctrl.node.nodes.length === 0));
      }
    }

    function toggleNode() {
      ctrl.isOpen = !ctrl.isOpen;
    }

    function toggleChildrenSelections(selections) {
      ctrl.onToggleChildrenSelections({selections: selections});
    }

    function toggleNodeSelection(selectedNode) {
      if (selectedNode) {
        if (selectedNode.type === 'd' || (Array.isArray(selectedNode.nodes) && selectedNode.nodes.length > 0)) {
          selectedNode.nodes.forEach(function (node) {
            ctrl.selections[node.path] = ctrl.selections[ctrl.currentNodePath];
          });
        }
      } else {
        if (!ctrl.isLeaf) {
          ctrl.currentNode.nodes.forEach(function (node) {
            ctrl.selections[node.path] = ctrl.selections[ctrl.currentNodePath];
            toggleNodeSelection(node);
          });
        }

        if (ctrl.parentNode && Array.isArray(ctrl.parentNode.nodes)) {
          var numberOfChildrenSelected = ctrl.parentNode.nodes.filter(function (node) {
            return ctrl.selections[node.path];
          }).length;

          ctrl.selections[ctrl.parentNode.path] = numberOfChildrenSelected === ctrl.parentNode.nodes.length;
        }

        ctrl.toggleChildrenSelections(ctrl.selections);
      }
    }

    ctrl.$onChanges = controllerOnChanges;
    ctrl.toggleNode = toggleNode;
    ctrl.toggleChildrenSelections = toggleChildrenSelections;
    ctrl.toggleNodeSelection = toggleNodeSelection;
  }
})
.controller('sfObibaSelectionTreeController', ['$scope',
  function ($scope) {

    function updateModel(selected) {
      var endOfPath = $scope.form.key.reduce(function (prev, curr) {
        prev = prev ? prev : $scope.model;
        return prev[curr];
      });

      endOfPath = selected;
    }

    function updateSelections() {
      var selectionsKeys = Object.keys($scope.selections);
      if (selectionsKeys && selectionsKeys.length > 0) {
        updateModel([]);

        var selected = selectionsKeys.filter(function (selectionKey) {
          return $scope.selections[selectionKey];
        });

        $scope.ngModel.$setViewValue(selected);
        updateModel(selected);
      }
    }

    $scope.selections = {};
    $scope.onSelectionUpdate = updateSelections;
  }
])
.filter('treeFilter', function () {
  function nodehasText(node, text) {
    var strings = ((node.path || "") + (node.title || "")).toLowerCase();
    var firstLevelIsOk = strings.indexOf(text) > -1;
    var nextLevelIsOk = (Array.isArray(node.nodes) && node.nodes.filter(function (nextLevelNode) { return nodehasText(nextLevelNode, text); }).length > 0);

    return firstLevelIsOk || nextLevelIsOk;
  }

  return function (nodes, text) {
    var lowercaseText = (text || "").trim().toLowerCase();
    
    if (lowercaseText.length === 0) {
      return nodes;
    }
    
    return (nodes || []).filter(function (node) {
      return nodehasText(node, lowercaseText);
    });
  }
});