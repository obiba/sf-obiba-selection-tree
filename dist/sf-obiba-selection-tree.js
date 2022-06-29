angular.module("sfObibaSelectionTreeTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("src/templates/sf-obiba-selection-tree-node.html","<div class=\"col-xs-12\">\n  <button ng-click=\"$ctrl.toggleNode()\" class=\"btn btn-sm btn-link\" type=\"button\">\n    <i class=\"glyphicon\" ng-show=\"!$ctrl.isLeaf\" ng-class=\"{\'glyphicon-menu-right\': !$ctrl.isOpen, \'glyphicon-menu-down\': $ctrl.isOpen}\"></i>\n    <div ng-show=\"$ctrl.isLeaf\" style=\"width: 1em;\"></div>\n  </button>\n\n  <input ng-show=\"!$ctrl.readonly\" type=\"checkbox\" name=\"{{$ctrl.currentNodePath}}\" ng-model=\"$ctrl.selections[$ctrl.currentNodePath]\" ng-change=\"$ctrl.toggleNodeSelection()\">\n\n  <span style=\"margin-left: 1em;\">\n    <i class=\"glyphicon\" ng-class=\"{\'glyphicon-folder-open\': !$ctrl.isLeaf, \'glyphicon-file\': $ctrl.isLeaf}\" style=\"margin-right: 0.5em;\"></i>\n    <span ng-show=\"!$ctrl.hasAttributes\">{{$ctrl.currentNodeTitle}}</span>\n    <button ng-show=\"$ctrl.hasAttributes\" ng-click=\"$ctrl.toggleAttributes($ctrl.currentNode)\" class=\"btn btn-link\" type=\"button\">{{$ctrl.currentNodeTitle}}</button>\n  </span>\n\n  <div ng-show=\"!$ctrl.isLeaf && $ctrl.isOpen\" class=\"row\" style=\"margin-left: 1.25em;\">\n    <sf-obiba-selection-tree-node\n      ng-repeat=\"node in $ctrl.currentNode.nodes | treeFilter:$ctrl.textFilter\"\n      node=\"node\"\n      selections=\"$ctrl.selections\"\n      text-filter=\"$ctrl.textFilter\"\n      parent-node=\"$ctrl.currentNode\"\n      on-toggle-children-selections=\"$ctrl.toggleChildrenSelections(selections)\"\n      on-toggle-attributes=\"$ctrl.toggleAttributes(node)\"\n      readonly=\"$ctrl.readonly\">\n    </sf-obiba-selection-tree-node>\n  </div>\n</div>");
$templateCache.put("src/templates/sf-obiba-selection-tree.html","<div\n  class=\"form-group\"\n  ng-class=\"{\'has-error\': form.disableErrorState !== true && hasError(), \'has-success\': form.disableSuccessState !== true && hasSuccess(), \'has-feedback\': form.feedback !== false }\"\n  ng-controller=\"sfObibaSelectionTreeController\"\n  schema-validate=\"form\"\n  sf-field-model>\n  <label ng-if=\"!form.notitle\" class=\"control-label\" >{{form.title}}</label>\n\n  <div class=\"row\" ng-hide=\"form.schema.noFilter\">\n    <div class=\"col-xs-4\">\n      <div class=\"input-group\">\n        <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-search\"></i></span>\n        <input type=\"text\" class=\"form-control\" ng-model=\"text\">\n      </div>\n    </div>        \n  </div>\n\n  <div class=\"row\">\n    <div ng-class=\"{\'col-xs-12\': !nodeAttributeShown, \'col-xs-5\': nodeAttributeShown}\">\n      <sf-obiba-selection-tree-node\n        ng-repeat=\"node in form.schema.nodes | treeFilter:text\"\n        node=\"node\"\n        selections=\"selections\"\n        text-filter=\"text\"\n        on-toggle-children-selections=\"onSelectionUpdate(selections)\"\n        on-toggle-attributes=\"toggleNodeAttributes(node)\"\n        readonly=\"form.readonly\">\n      </sf-obiba-selection-tree-node>\n    </div>\n\n    <div ng-show=\"nodeAttributeShown\" style=\"box-shadow: 0 5px 15px rgba(0,0,0,0.5);\" class=\"col-xs-7\">\n      <p ng-bind-html=\"renderedAttribute\"></p>\n    </div>    \n  </div>\n  <span class=\"help-block\" sf-message=\"form.helpvalue\"></span>\n</div>");}]);
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
    onToggleChildrenSelections: '&',
    onToggleAttributes: '&'
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
        ctrl.hasAttributes = ctrl.node && (Array.isArray(ctrl.node.attributes) && ctrl.node.attributes.length > 0);
      }
    }

    function toggleNode() {
      ctrl.isOpen = !ctrl.isOpen;
    }

    function toggleChildrenSelections(selections) {
      ctrl.onToggleChildrenSelections({selections: selections});
    }

    function toggleAttributes(node) {
      ctrl.onToggleAttributes({node: node});
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
    ctrl.toggleAttributes = toggleAttributes;
    ctrl.toggleNodeSelection = toggleNodeSelection;
  }
})
.controller('sfObibaSelectionTreeController', ['$scope', 'marked',
  function ($scope, marked) {

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

    function toggleNodeAttributes(node) {
      if (!$scope.nodeAttributeShown || $scope.nodeAttributeShown !== node.path) {
        $scope.nodeAttributeShown = node.path;
        render(node.attributes);
      } else {
        $scope.nodeAttributeShown = undefined;
        $scope.renderedAttribute = '';
      }      
    }

    function render(attributes) {
      var html = '';
      attributes.forEach(function (attribute) {
        if (html.trim().length > 0) {
          html = html + '\n\n';
        }

        html = html + (attribute.title && attribute.title.trim().length > 0 ? attribute.title + '\n\n' : '') + (attribute.body && attribute.body.trim().length > 0 ? attribute.body : '');
      });

      $scope.renderedAttribute = marked(html);
    }

    $scope.nodeAttributeShown = undefined;
    $scope.renderedAttribute = '';
    $scope.selections = {};
    $scope.onSelectionUpdate = updateSelections;
    $scope.toggleNodeAttributes = toggleNodeAttributes;
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