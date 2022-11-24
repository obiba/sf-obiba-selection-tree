angular.module('sfObibaSelectionTree', ['schemaForm', 'sfObibaSelectionTreeTemplates'])
.config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfBuilderProvider', 'sfPathProvider',
  function (schemaFormProvider, schemaFormDecoratorsProvider, sfBuilderProvider, sfPathProvider) {

    function obibaSelectionTree(name, schema, options) {
      if ((schema.type === 'array' || schema.type === 'string') && schema.format === 'obibaSelectionTree') {
        var f = schemaFormProvider.stdFormObj(name, schema, options);
        f.key = options.path;
        f.type = 'obibaSelectionTree';
        if (schema.type === 'array')
          f.multiple = 'multiple';
        options.lookup[sfPathProvider.stringify(options.path)] = f;
        return f;
      }
    }

    schemaFormProvider.defaults.array.unshift(obibaSelectionTree);
    schemaFormProvider.defaults.string.unshift(obibaSelectionTree);

    schemaFormDecoratorsProvider.defineAddOn('bootstrapDecorator', 'obibaSelectionTree', 'src/templates/sf-obiba-selection-tree.html', sfBuilderProvider.stdBuilders);
  }
])
.component('sfObibaSelectionTreeNode', {
  bindings: {
    node: '<',
    selections: '<',
    readonly: '<',
    single: '<',
    parentNode: '<',
    textFilter: '<',
    onToggleChildrenSelections: '&',
    onToggleDescription: '&'
  },
  templateUrl: 'src/templates/sf-obiba-selection-tree-node.html',
  controller: ['$scope', function($scope) {
    const ctrl = this;

    function controllerOnChanges(changeObj) {
      if (changeObj.node && changeObj.node.currentValue && changeObj.node.currentValue.path) {
        ctrl.currentNode = changeObj.node.currentValue;
        ctrl.currentNodePath = ctrl.node.path;
        ctrl.currentNodeTitle = ctrl.node.title || ctrl.node.path;
        ctrl.isLeaf = ctrl.node && (ctrl.node.type !== 'd' && (!Array.isArray(ctrl.node.nodes) || ctrl.node.nodes.length === 0));
        ctrl.hasDescription = ctrl.node && ctrl.node.description;
      }
    }

    function toggleNode() {
      ctrl.isOpen = !ctrl.isOpen;
    }

    function toggleChildrenSelections(selections) {
      // for consistency, verify selected vs. all children selected
      if (!ctrl.isLeaf && Array.isArray(ctrl.currentNode.nodes)) {
        var numberOfChildrenSelected = ctrl.currentNode.nodes.filter(function (node) {
          return selections[node.path];
        }).length;
        selections[ctrl.currentNode.path] = numberOfChildrenSelected === ctrl.currentNode.nodes.length;
      }
      ctrl.onToggleChildrenSelections({selections: selections});
    }

    function toggleDescription(node) {
      ctrl.onToggleDescription({node: node});
    }

    function nodehasText(node) {
      var text = (ctrl.textFilter || "").trim().toLowerCase();
      if (text.length === 0) return true;

      var strings = ((node.path || "") + (node.title || "")).toLowerCase();
      var firstLevelIsOk = strings.indexOf(text) > -1;
      var nextLevelIsOk = (Array.isArray(node.nodes) && node.nodes.filter(function (nextLevelNode) { return nodehasText(nextLevelNode); }).length > 0);

      return firstLevelIsOk || nextLevelIsOk;
    }

    function toggleNodeSelection(selectedNode) {
      if (selectedNode) {
        if (selectedNode.type === 'd' || (Array.isArray(selectedNode.nodes) && selectedNode.nodes.length > 0)) {
          selectedNode.nodes.filter(nodehasText).forEach(function (node) {
            ctrl.selections[node.path] = ctrl.selections[ctrl.currentNodePath];
            toggleNodeSelection(node);
          });
        }
      } else {
        if (!ctrl.isLeaf) {
          ctrl.currentNode.nodes.filter(nodehasText).forEach(function (node) {
            ctrl.selections[node.path] = ctrl.selections[ctrl.currentNodePath];
            toggleNodeSelection(node);
          });
        }
        if (ctrl.single) {
          const keys = Object.keys(ctrl.selections)
          keys.forEach(function(k) {
            if (k !== ctrl.currentNodePath) {
              delete ctrl.selections[k]
            } 
          })
          ctrl.onToggleChildrenSelections({selections: ctrl.selections});
        } else
          ctrl.toggleChildrenSelections(ctrl.selections);
      }
    }

    $scope.$on('st-expand-all', function () {
      ctrl.isOpen = true;
    });

    $scope.$on('st-collapse-all', function () {
      ctrl.isOpen = false;
    });

    ctrl.$onChanges = controllerOnChanges;
    ctrl.toggleNode = toggleNode;
    ctrl.toggleChildrenSelections = toggleChildrenSelections;
    ctrl.toggleDescription = toggleDescription;
    ctrl.toggleNodeSelection = toggleNodeSelection;
  }]
})
.controller('sfObibaSelectionTreeController', ['$scope', 'marked',
  function ($scope, marked) {

    function init() {
      var val = $scope.ngModel.$modelValue;
      
      if (Array.isArray(val)) {
        val.map(function (value) {
          $scope.selections[value] = true;
        });
      } else if (typeof val === 'string') {
        $scope.selections[val] = true;
      }
    }

    function updateSelections() {
      var selectionsKeys = Object.keys($scope.selections);
      if (selectionsKeys && selectionsKeys.length > 0) {
        var selected = selectionsKeys.filter(function (selectionKey) {
          return $scope.selections[selectionKey];
        }).sort(); // sort so that selections are ordered by path
        var selectedValue;
        if ($scope.form.schema.type === 'string') {
          if (selected.length === 0) {
            selectedValue = undefined;  
          } else {
            selectedValue = selected.pop();
          }
        } else {
          selectedValue = selected;
        }
        $scope.ngModel.$setViewValue(selectedValue);
      } else {
        $scope.ngModel.$setViewValue(undefined);
      }
    }

    function toggleNodeDescription(node) {
      if (!$scope.nodeDescriptionShown || $scope.nodeDescriptionShown !== node.path) {
        $scope.nodeDescriptionShown = node.path;
        render(node.description);
      } else {
        $scope.nodeDescriptionShown = undefined;
        $scope.renderedDescription = '';
      }
    }

    function render(lines) {
      var html = '';
      var appendLineToHtml = function (line) {
        if (html.trim().length > 0) {
          html = html + '\n';
        }

        html = html + (line && line.trim().length > 0 ? line + '\n' : '');
      };

      if (Array.isArray(lines))
        lines.forEach(appendLineToHtml);
      else
        appendLineToHtml(lines);

      $scope.renderedDescription = marked(html);
    }

    function toggleShowTree() {
      $scope.showTree = !$scope.showTree;  
    }

    function expandAll() {
      $scope.$broadcast('st-expand-all');
    }

    function collapseAll() {
      $scope.$broadcast('st-collapse-all');
    }
    
    function clear() {
      $scope.selections = {};
      updateSelections();  
    }

    function selectionsCountLabel() {
      var selectionsCountLabel = $scope.form.selectionsCountLabel || '{0} selected items';
      return selectionsCountLabel.replace('{0}', $scope.ngModel.$modelValue.length);
    }

    $scope.nodeDescriptionShown = undefined;
    $scope.renderedDescription = '';
    $scope.selections = {};
    $scope.onSelectionUpdate = updateSelections;
    $scope.toggleNodeDescription = toggleNodeDescription;
    $scope.showTree = false;
    $scope.toggleShowTree = toggleShowTree;
    $scope.expandAll = expandAll;
    $scope.collapseAll = collapseAll;
    $scope.clear = clear;
    $scope.initialized = false;
    $scope.noSelectionLabel = 'No selection';
    $scope.selectionsCountLabel = selectionsCountLabel;
    $scope.noFilter = false;
    
    $scope.$watch('form', function () {
      $scope.noFilter = $scope.form.noFilter || $scope.form.schema.noFilter; // legacy
      $scope.isSingle = $scope.form.schema.type === 'string';
      $scope.isPopup = $scope.isSingle || ($scope.form.popup === true);
      $scope.showTree = !$scope.isPopup;
      $scope.noSelectionLabel = $scope.form.noSelectionLabel || 'No selection';
    });

    $scope.$watch('ngModel.$modelValue', function () {
      init();
    });
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
})
.directive('indeterminate', [function() {
  return {
     require: '?ngModel',
     link: function(scope, el, attrs, ctrl) {
        var isIndeterminate = function(node) {
          if (!node.nodes) {
            return false;
          }
          var selections = scope.$ctrl.selections;
          var numberOfChildrenSelected = node.nodes.filter(function (child) {
            return selections[child.path];
          }).length;
          var numberOfChildren = node.nodes.length;
          if (numberOfChildrenSelected === 0 && numberOfChildren > 0) {
            // one of the children may be indeterminate in which case the parent (=current) will be indterminate
            var childIndeterminate = node.nodes.map(function (child) {
              return isIndeterminate(child);
            }).filter(function (val) {
              return val;
            }).pop();
            return childIndeterminate === true;
          }
          return numberOfChildrenSelected > 0 && numberOfChildrenSelected < numberOfChildren;
        };

        ctrl.$formatters = [];
        ctrl.$parsers = [];
        ctrl.$render = function() {
          var d = ctrl.$viewValue;
          el.data('checked', d);

          if (d) {
            el.prop('indeterminate', false);
            el.prop('checked', true);
          } else {
            el.prop('indeterminate', isIndeterminate(scope.$ctrl.currentNode));
            el.prop('checked', false);
          }
        };
        el.bind('click', function() {
           var d = el.data('checked') ? false : true;
           ctrl.$setViewValue(d);
           scope.$apply(ctrl.$render);
        });
     }
  };
}]);