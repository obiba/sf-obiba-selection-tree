angular.module("sfObibaSelectionTreeTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("src/templates/sf-obiba-selection-tree-node.html","<div class=\"col-xs-12\">\n  <button ng-click=\"$ctrl.toggleNode()\" class=\"btn btn-sm btn-link\" type=\"button\">\n    <i class=\"glyphicon\" ng-show=\"!$ctrl.isLeaf\" ng-class=\"{\'glyphicon-menu-right\': !$ctrl.isOpen, \'glyphicon-menu-down\': $ctrl.isOpen}\"></i>\n    <div ng-show=\"$ctrl.isLeaf\" style=\"width: 1em;\"></div>\n  </button>\n\n  <input ng-show=\"!$ctrl.readonly\" type=\"checkbox\" name=\"{{$ctrl.currentNodePath}}\" ng-model=\"$ctrl.selections[$ctrl.currentNodePath]\" ng-change=\"$ctrl.toggleNodeSelection()\">\n\n  <span style=\"margin-left: 1em;\">\n    <i class=\"glyphicon\" ng-class=\"{\'glyphicon-folder-open\': !$ctrl.isLeaf, \'glyphicon-file\': $ctrl.isLeaf}\" style=\"margin-right: 0.5em;\"></i>\n    {{$ctrl.currentNodeTitle}}\n\n    <button ng-show=\"$ctrl.hasAttributes\" ng-click=\"$ctrl.toggleAttributes()\" class=\"btn btn-sm btn-link\" type=\"button\">\n      <i class=\"glyphicon glyphicon-asterisk\"></i>\n    </button>\n  </span>\n\n  <div ng-show=\"!$ctrl.isLeaf && $ctrl.isOpen\" class=\"row\" style=\"margin-left: 1.25em;\">\n    <sf-obiba-selection-tree-node\n      ng-repeat=\"node in $ctrl.currentNode.nodes\"\n      node=\"node\"\n      selections=\"$ctrl.selections\"\n      parent-node=\"$ctrl.currentNode\"\n      on-toggle-children-selections=\"$ctrl.toggleChildrenSelections(selections)\"\n      readonly=\"$ctrl.readonly\">\n    </sf-obiba-selection-tree-node>\n  </div>\n</div>");
$templateCache.put("src/templates/sf-obiba-selection-tree.html","<div\n  class=\"form-group\"\n  ng-class=\"{\'has-error\': form.disableErrorState !== true && hasError(), \'has-success\': form.disableSuccessState !== true && hasSuccess(), \'has-feedback\': form.feedback !== false }\"\n  ng-controller=\"sfObibaSelectionTreeController\"\n  schema-validate=\"form\"\n  sf-field-model>\n  <label ng-if=\"!form.notitle\" class=\"control-label\" >{{form.title}}</label>\n\n  <div class=\"row\">\n    <sf-obiba-selection-tree-node\n      ng-repeat=\"node in form.schema.nodes\"\n      node=\"node\"\n      selections=\"selections\"\n      on-toggle-children-selections=\"onSelectionUpdate(selections)\"\n      readonly=\"form.readonly\">\n    </sf-obiba-selection-tree-node>\n  </div>\n\n  <span class=\"help-block\" sf-message=\"form.helpvalue\"></span>\n</div>");}]);
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
        ctrl.hasAttributes = ctrl.node && ctrl.attributes;
      }
    }

    function toggleNode() {
      ctrl.isOpen = !ctrl.isOpen;
    }

    function toggleAttributes() {
      ctrl.attributesAreOpen = !ctrl.attributesAreOpen;
    }

    function toggleChildrenSelections(selections) {
      ctrl.onToggleChildrenSelections({selections: selections});
    }

    function toggleNodeSelection(selectedNode) {
      if (selectedNode) {
        if (selectedNode.type === 'd' || (Array.isArray(selectedNode.nodes) && selectedNode.nodes.length > 0)) {
          selectedNode.nodes.forEach(function(node) {
            ctrl.selections[node.path] = ctrl.selections[ctrl.currentNodePath];
          });
        }
      } else {
        if (!ctrl.isLeaf) {
          ctrl.currentNode.nodes.forEach(function(node) {
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
    ctrl.toggleAttributes = toggleAttributes;
  }
})
.controller('sfObibaSelectionTreeController', ['$scope',
  function($scope) {
    function updateSelections() {
      var selectionsKeys = Object.keys($scope.selections);
      if (selectionsKeys && selectionsKeys.length > 0) {
        var model = $scope.model[$scope.form.key] || [];
        model.length = 0;

        var selected = selectionsKeys.filter(function (selectionKey) {
          return $scope.selections[selectionKey];
        });

        $scope.ngModel.$setViewValue(selected);
        selected.forEach(function (s) {
          model.push(s);
        });

        $scope.model[$scope.form.key] = model;
      }
    }

    $scope.selections = {};
    $scope.onSelectionUpdate = updateSelections;
  }
]);