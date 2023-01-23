angular.module("sfObibaSelectionTreeTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("src/templates/sf-obiba-selection-tree-node.html","<div class=\"st-node\">\n  <a ng-click=\"$ctrl.toggleNode()\" class=\"btn btn-sm\">\n    <i class=\"glyphicon\" ng-show=\"!$ctrl.isLeaf\" ng-class=\"{\'glyphicon-menu-right\': !$ctrl.isOpen, \'glyphicon-menu-down\': $ctrl.isOpen}\"></i>\n    <div ng-show=\"$ctrl.isLeaf\" style=\"width: 1em;\"></div>\n  </a>\n\n  <input type=\"checkbox\" name=\"{{$ctrl.currentNodePath}}\" indeterminate \n    ng-disabled=\"$ctrl.readonly || (!$ctrl.isLeaf && $ctrl.single)\" \n    ng-model=\"$ctrl.selections[$ctrl.currentNodePath]\" \n    ng-change=\"$ctrl.toggleNodeSelection()\"\n    style=\"margin-right: 1em;\">\n\n  <span>\n    <i class=\"glyphicon\" ng-class=\"{\'glyphicon-folder-open\': !$ctrl.isLeaf, \'glyphicon-file\': $ctrl.isLeaf}\" style=\"margin-right: 0.5em;\"></i>\n    <span ng-show=\"!$ctrl.hasDescription\">{{$ctrl.currentNodeTitle}}</span>\n    <a href=\"javascript:void(0)\" ng-show=\"$ctrl.hasDescription\" ng-click=\"$ctrl.toggleDescription($ctrl.currentNode)\" class=\"btn btn-link\">{{$ctrl.currentNodeTitle}}</a>\n  </span>\n\n  <div ng-show=\"!$ctrl.isLeaf && $ctrl.isOpen\" style=\"margin-left: 1.25em;\">\n    <sf-obiba-selection-tree-node\n      ng-repeat=\"node in $ctrl.currentNode.nodes | treeFilter:$ctrl.textFilter\"\n      node=\"node\"\n      selections=\"$ctrl.selections\"\n      text-filter=\"$ctrl.textFilter\"\n      single=\"$ctrl.single\"\n      parent-node=\"$ctrl.currentNode\"\n      on-toggle-children-selections=\"$ctrl.toggleChildrenSelections(selections)\"\n      on-toggle-description=\"$ctrl.toggleDescription(node)\"\n      readonly=\"$ctrl.readonly\">\n    </sf-obiba-selection-tree-node>\n  </div>\n</div>");
$templateCache.put("src/templates/sf-obiba-selection-tree.html","<div\n  class=\"form-group st-form-group\"\n  ng-class=\"{\'has-error\': form.disableErrorState !== true && hasError(), \'has-success\': form.disableSuccessState !== true && hasSuccess(), \'has-feedback\': form.feedback !== false }\"\n  ng-controller=\"sfObibaSelectionTreeController\"\n  schema-validate=\"form\"\n  sf-field-model>\n  <label ng-if=\"!form.notitle\" class=\"control-label\" >{{form.title}}</label>\n\n  <div ng-if=\"isPopup\" class=\"st-head\">\n    <span ng-if=\"isSingle\" ng-class=\"ngModel.$modelValue ? \'st-selection\' : \'st-no-selection\' \">{{ toLabel(ngModel.$modelValue) || noSelectionLabel }}</span>\n    <span ng-if=\"!isSingle && (!ngModel.$modelValue || ngModel.$modelValue.length === 0)\" class=\"st-selection\">{{ noSelectionLabel }}</span>\n    <ul ng-if=\"!isSingle && ngModel.$modelValue && ngModel.$modelValue.length > 0\">\n      <li ng-repeat=\"item in ngModel.$modelValue\">{{ toLabel(item) }}</li>\n    </ul>\n    <button ng-if=\"!form.readonly\" ng-click=\"toggleShowTree()\" class=\"st-selector btn btn-sm btn-default\" type=\"button\">{{ form.selectLabel || \'Select...\' }}</button>\n    <a ng-if=\"form.readonly && ngModel.$modelValue\" ng-click=\"toggleShowTree()\" class=\"st-selector st-show\">{{ form.showDetailsLabel || \'Show details...\' }}</a>\n  </div>\n\n  <div ng-show=\"!isPopup || showTree\" ng-class=\"\'st-card-\' + (isPopup ? \'popup\' : \'inline\')\">\n\n    <div class=\"st-card-section\">\n      <div ng-if=\"isPopup\" ng-click=\"toggleShowTree()\" class=\"st-card-header\">\n        <span ng-if=\"isSingle\">{{ ngModel.$modelValue || noSelectionLabel }}</span>\n        <span ng-if=\"!isSingle\">{{ ngModel.$modelValue ? selectionsCountLabel() : noSelectionLabel }}</span>\n        <i class=\"glyphicon glyphicon-remove st-close\"></i>\n      </div>\n      <div ng-if=\"isPopup && !form.notitle\" class=\"st-card-title\">\n        <label>{{ form.title }}</label>\n      </div>\n      <div ng-if=\"isPopup && !form.readonly && form.selectionTipLabel\" class=\"st-card-help\">\n        <p class=\"help-block\">{{ form.selectionTipLabel }}</p>\n      </div>\n      <div class=\"row\">\n        <div ng-class=\"{\'col-12 col-xs-12\': !nodeDescriptionShown, \'col-5 col-xs-5\': nodeDescriptionShown}\" class=\"st-card-body\">\n          <div class=\"input-group\" ng-hide=\"noFilter\" style=\"max-width: 200px\" class=\"st-filter\">\n            <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-search\"></i></span>\n            <input type=\"text\" class=\"form-control\" ng-model=\"text\">\n          </div>\n          <div ng-hide=\"form.noExpandCollapse\" style=\"margin: 10px 0 10px 0;\">\n            <a ng-click=\"expandAll()\" class=\"btn btn-sm\">{{ form.expandAllLabel || \'Expand all\' }}</a>\n            <a ng-click=\"collapseAll()\" class=\"btn btn-sm\">{{ form.collapseAllLabel || \'Collapse all\' }}</a>\n            <a ng-if=\"!form.readonly\" ng-click=\"clear()\" class=\"btn btn-sm\">{{ form.clearLabel || \'Clear\' }}</a>\n            <a ng-if=\"form.readonly && form.downloadLabel !== false && ngModel.$modelValue\" ng-click=\"downloadSelections()\" class=\"btn btn-sm\">{{ form.downloadLabel || \'Download\' }}</a>\n          </div>\n          <sf-obiba-selection-tree-node\n            ng-repeat=\"node in form.schema.nodes | treeFilter:text\"\n            node=\"node\"\n            selections=\"selections\"\n            text-filter=\"text\"\n            single=\"isSingle\"\n            on-toggle-children-selections=\"onSelectionUpdate(selections)\"\n            on-toggle-description=\"toggleNodeDescription(node)\"\n            readonly=\"form.readonly\"\n            class=\"st-tree\">\n          </sf-obiba-selection-tree-node>\n        </div>\n    \n        <div ng-show=\"nodeDescriptionShown\" class=\"col-7 col-xs-7\">\n          <div class=\"st-description\">\n            <div class=\"st-description-head help-block\">\n              <span>{{ nodeDescriptionShown }}</span>\n            </div>\n            <div ng-bind-html=\"renderedDescription\" class=\"st-description-body\"></div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  \n  \n  <span class=\"help-block\" sf-message=\"form.helpvalue || form.description\"></span>\n</div>");}]);
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
      var values = Array.isArray(val) ? val : (typeof val === 'string' ? [val] : [])
      values = values.map(function(x) { return x}) // desctructuring the reactive array, the old way

      function selectNodes(nodes) {
        if (nodes) {
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i]
            selectNodes(node.nodes)
            if (values.includes(node.path)) {
              $scope.selections[node.path] = true;
            } else if (node.nodes) {
              var notAllSelected = node.nodes.map(function(child) {
                return values.includes(child.path)
              }).includes(false)
              // select node if all children where selected
              if (!notAllSelected) {
                $scope.selections[node.path] = true;
                values.push(node.path)
              }
            }
          }
        }  
      }
      
      // apply selections
      selectNodes($scope.form.schema.nodes)
    }

    function findNode(nodes, path) {
      var found = undefined
      if (nodes) {
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i]
          if (node.path === path) {
            found = node
          } else {
            found = findNode(node.nodes, path)
          }
          if (found) {
            break
          }
        }
      }
      return found
    }

    function toLabel(path) {
      if (path) {
        return toTitles($scope.form.schema.nodes, path)
      }
      return
    }

    function toTitles(nodes, path, acc) {
      var title = undefined
      if (nodes) {
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i]
          if (node.path === path) {
            title = node.title
          } else {
            title = toTitles(node.nodes, path, node.title)
          }
          if (title) {
            title = acc ? acc + ' > ' + title : title
            break
          }
        }
      }
      return title
    }

    function isLeaf(node) {
      return node && !(node.type === 'd' || (Array.isArray(node.nodes) && node.nodes.length > 0))
    }

    function updateSelections() {
      var selectionsKeys = Object.keys($scope.selections);
      if (selectionsKeys && selectionsKeys.length > 0) {
        var selected = selectionsKeys.filter(function (selectionKey) {
          return $scope.selections[selectionKey];
        }).sort(); // sort so that selections are ordered by path

        // filter leafs
        selected = selected.filter(function(path) {
          var found = findNode($scope.form.schema.nodes, path)
          return isLeaf(found)
        })

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

    function downloadSelections() {
      // Empty array for storing the values
      var csvRows = [];

      csvRows.push(['path', 'label', 'title'].join(','));
      if ($scope.ngModel.$modelValue) {
        if (Array.isArray($scope.ngModel.$modelValue)) {
          $scope.ngModel.$modelValue.forEach(function(path) {
            var found = findNode($scope.form.schema.nodes, path)
            if (found) {
              csvRows.push(['"' + found.path + '"', '"' + toLabel(path) + '"', '"' + found.title + '"'].join(','));
            }
          });
        } else if (typeof $scope.ngModel.$modelValue === 'string') {
          var path = $scope.ngModel.$modelValue
          var found = findNode($scope.form.schema.nodes, path)
          if (found) {
            csvRows.push(['"' + found.path + '"', '"' + toLabel(path) + '"', '"' + found.title + '"'].join(','));
          }
        }
      }
      
      // Creating a Blob for having a csv file format
      // and passing the data with type
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  
      // Creating an object for downloading url
      const url = window.URL.createObjectURL(blob)
  
      // Creating an anchor(a) tag of HTML
      const a = document.createElement('a')
  
      // Passing the blob downloading url
      a.setAttribute('href', url)
  
      // Setting the anchor tag attribute for downloading
      // and passing the download file name
      a.setAttribute('download', $scope.form.key.filter(function(val) {return val !== ''}).join('-') + '.csv');
  
      // Performing a download with click
      a.click()
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
    $scope.downloadSelections = downloadSelections;
    $scope.toLabel = toLabel;
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