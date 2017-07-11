angular.module('ionicCapri')

.filter('itemSelected', function() {
    return function(items) {
        var filtered = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.selected) {
                filtered.push(item);
            }
        }
        return filtered;
    };
})

.controller("portfolioCtrl", function ($scope, details, $interval) {
  // -----------------------------
  // ------ Propositions ---------
  // -----------------------------
    
  $scope.noPropSelected = true;
  $scope.selectProp = function (index) {
    selectedProposal = $scope.propositions[index];
    selectedProposal.selected = !selectedProposal.selected;
    var direction = !selectedProposal.selected ? -1 : 1;
    $scope.updateGroupbarClassValue("Action", direction * selectedProposal.Action);
    $scope.updateGroupbarClassValue("Obligation", direction * selectedProposal.Obligation);
    $scope.updateGroupbarClassValue("Cash", direction * selectedProposal.Cash);
    $scope.updateGroupbarClassValue("Autre", direction * selectedProposal.Autre);
      
    $scope.noPropSelected = true;
    for (i = 0; i < $scope.propositions.length; i++) {
        if ($scope.propositions[i].selected) {
            $scope.noPropSelected = false;
            break;
        }
    }
  }
  $scope.selectAllProp = function () {
    var allProps = $scope.allPropsSelected();
    for (var i in $scope.propositions) {
      if (!$scope.propositions[i].selected && !allProps || $scope.propositions[i].selected && allProps) {
        $scope.selectProp(i);
      }
    }
  }

  $scope.allPropsSelected = function () {
    var retVal = true;
    var initVal = !!$scope.propositions[0].selected;
    for (i = 1; i < $scope.propositions.length; i++) {
      if (!!$scope.propositions[i].selected != initVal) {
        retVal = false;
        break;
      }
    }
    return retVal & initVal;
  };
    
  // -----------------------------
  // -------- Period Menu --------
  // -----------------------------
  $scope.uniqueId = {'id': (0|Math.random()*9e6).toString(36)}
  $scope.periods = [{ text: "Mois",     value: "30", name: [$scope.uniqueId] },
                    { text: "Semestre", value: "90", name: [$scope.uniqueId]},
                    { text: "Année",    value: "250", name: [$scope.uniqueId] }];

  $scope.periodSel = '30'; // Default selection

  // -----------------------------
  // --------- Main Menu ---------
  // -----------------------------
  $scope.mainMenu = [ { text: "Portefeuilles",        value: "all"},
                      { text: "Détails portefeuille", value: "wallet" },
                      { text: "Optimisation",         value: "optimization" }];
  $scope.mainMenuSel = "all";
  $scope.mainMenuChange = function (item) {
    $scope.mainMenuSel = item;

    var svgs = [];
    for (var i=0; i < Object.keys($scope.dataModel.client).length; i++) {
      svgs.push(angular.element(document.getElementById("curve-svg-"+i)));
    }
    var contentGraph = angular.element(document.getElementsByClassName("content-graph"));
    var contentPane = angular.element(document.getElementsByClassName("content-pane"));
    var bottomPane = angular.element(document.getElementsByClassName("bottom-pane"));

    // Resize
    if ($scope.mainMenuSel === "all" && !contentPane.hasClass("content-pane-max")) {
      contentPane.addClass("content-pane-max");
    } else if ($scope.mainMenuSel !== "all" && contentPane.hasClass("content-pane-max")) {
      contentPane.removeClass("content-pane-max");
      bottomPane.removeClass("ng-hide");
    }
    $interval(function (i) {
      var targetHeight = contentGraph.prop('offsetHeight');
      for (var i=0; i < svgs.length; i++) {
        svgs[i].attr("height", targetHeight).attr("width", $(window).width());
      }
    }, 10, 40);
    if ($scope.mainMenuSel === "all" && !contentPane.hasClass("content-pane-max")) {
      bottomPane.addClass("ng-hide");
    }

    // Update bottom panes
    switch ($scope.mainMenuSel) {
      case "all":
        $scope.bottomPane.left = "templates/blank.html";
        $scope.bottomPane.right = "templates/blank.html";
        break;
      case "wallet":
        $scope.bottomPane.left = "templates/constituants.html";
        $scope.bottomPane.right = "templates/wallet.html";
        break;
      case "optimization":
        $scope.bottomPane.left = "templates/propositions.html";
        $scope.bottomPane.right = "templates/synthesis.html";
        break;
    }
  };
})
