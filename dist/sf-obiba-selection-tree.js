angular.module("sfObibaSelectionTreeTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("src/templates/sf-obiba-selection-tree-node.html","<div class=\"st-node\">\n  <button ng-click=\"$ctrl.toggleNode()\" class=\"btn btn-sm btn-link\" type=\"button\">\n    <i class=\"glyphicon\" ng-show=\"!$ctrl.isLeaf\" ng-class=\"{\'glyphicon-menu-right\': !$ctrl.isOpen, \'glyphicon-menu-down\': $ctrl.isOpen}\"></i>\n    <div ng-show=\"$ctrl.isLeaf\" style=\"width: 1em;\"></div>\n  </button>\n\n  <input ng-disabled=\"$ctrl.readonly\" type=\"checkbox\" name=\"{{$ctrl.currentNodePath}}\" indeterminate ng-model=\"$ctrl.selections[$ctrl.currentNodePath]\" ng-change=\"$ctrl.toggleNodeSelection()\">\n\n  <span style=\"margin-left: 1em;\">\n    <i class=\"glyphicon\" ng-class=\"{\'glyphicon-folder-open\': !$ctrl.isLeaf, \'glyphicon-file\': $ctrl.isLeaf}\" style=\"margin-right: 0.5em;\"></i>\n    <span ng-show=\"!$ctrl.hasDescription\">{{$ctrl.currentNodeTitle}}</span>\n    <button ng-show=\"$ctrl.hasDescription\" ng-click=\"$ctrl.toggleDescription($ctrl.currentNode)\" class=\"btn btn-link\" type=\"button\">{{$ctrl.currentNodeTitle}}</button>\n  </span>\n\n  <div ng-show=\"!$ctrl.isLeaf && $ctrl.isOpen\" style=\"margin-left: 1.25em;\">\n    <sf-obiba-selection-tree-node\n      ng-repeat=\"node in $ctrl.currentNode.nodes | treeFilter:$ctrl.textFilter\"\n      node=\"node\"\n      selections=\"$ctrl.selections\"\n      text-filter=\"$ctrl.textFilter\"\n      parent-node=\"$ctrl.currentNode\"\n      on-toggle-children-selections=\"$ctrl.toggleChildrenSelections(selections)\"\n      on-toggle-description=\"$ctrl.toggleDescription(node)\"\n      readonly=\"$ctrl.readonly\">\n    </sf-obiba-selection-tree-node>\n  </div>\n</div>");
$templateCache.put("src/templates/sf-obiba-selection-tree.html","<div\n  class=\"form-group st-form-group\"\n  ng-class=\"{\'has-error\': form.disableErrorState !== true && hasError(), \'has-success\': form.disableSuccessState !== true && hasSuccess(), \'has-feedback\': form.feedback !== false }\"\n  ng-controller=\"sfObibaSelectionTreeController\"\n  schema-validate=\"form\"\n  sf-field-model>\n  <label ng-if=\"!form.notitle\" class=\"control-label\" >{{form.title}}</label>\n\n  <div class=\"row\">\n    <div ng-class=\"{\'col-12 col-xs-12\': !nodeDescriptionShown, \'col-5 col-xs-5\': nodeDescriptionShown}\" class=\"st-tree\">\n      <div class=\"input-group\" ng-hide=\"form.schema.noFilter\" style=\"max-width: 200px\">\n        <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-search\"></i></span>\n        <input type=\"text\" class=\"form-control\" ng-model=\"text\">\n      </div>\n      <sf-obiba-selection-tree-node\n        ng-repeat=\"node in form.schema.nodes | treeFilter:text\"\n        node=\"node\"\n        selections=\"selections\"\n        text-filter=\"text\"\n        on-toggle-children-selections=\"onSelectionUpdate(selections)\"\n        on-toggle-description=\"toggleNodeDescription(node)\"\n        readonly=\"form.readonly\">\n      </sf-obiba-selection-tree-node>\n    </div>\n\n    <div ng-show=\"nodeDescriptionShown\" class=\"col-7 col-xs-7 st-description\">\n      <div ng-bind-html=\"renderedDescription\"></div>\n    </div>    \n  </div>\n  <span class=\"help-block\" sf-message=\"form.helpvalue\"></span>\n</div>");}]);
angular.module('sfObibaSelectionTree', ['schemaForm', 'sfObibaSelectionTreeTemplates'])
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
    onToggleChildrenSelections: '&',
    onToggleDescription: '&'
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
        ctrl.toggleChildrenSelections(ctrl.selections);
      }
    }

    ctrl.$onChanges = controllerOnChanges;
    ctrl.toggleNode = toggleNode;
    ctrl.toggleChildrenSelections = toggleChildrenSelections;
    ctrl.toggleDescription = toggleDescription;
    ctrl.toggleNodeSelection = toggleNodeSelection;
  }
})
.controller('sfObibaSelectionTreeController', ['$scope', 'marked',
  function ($scope, marked) {

    function init() {
      var val = [];
      $scope.form.key.forEach(function (key) {
        val = $scope.model[key];
      });

      if (Array.isArray(val)) {
        val.map(function (value) {
          $scope.selections[value] = true;
        });
      }
    }

    function updateSelections() {
      var selectionsKeys = Object.keys($scope.selections);
      if (selectionsKeys && selectionsKeys.length > 0) {
        var selected = selectionsKeys.filter(function (selectionKey) {
          return $scope.selections[selectionKey];
        });
        $scope.ngModel.$setViewValue(selected);
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

    $scope.nodeDescriptionShown = undefined;
    $scope.renderedDescription = '';
    $scope.selections = {};
    $scope.onSelectionUpdate = updateSelections;
    $scope.toggleNodeDescription = toggleNodeDescription;

    $scope.$watch('form', function () {
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