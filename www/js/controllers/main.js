angular.module('ionicCapri')
.controller('AppCtrl', function (dataModel, clientName, details, $scope, $interval, $timeout, $rootScope, $ionicModal) {
  // Constantes
  var monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  var dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  $scope.modalAllAcked = false;
  $scope.modalCanValidate = false;

  $scope.toggleModalAck = function(index) {
      $scope.propositions[index].acked = !$scope.propositions[index].acked;
      $scope.modalAllAcked = false;
      for (i = 0; i < $scope.propositions.length; i++) {
            if ($scope.propositions[i].selected && !$scope.propositions[i].acked) {
                return;
            }
      }
      $scope.modalAllAcked = true;
  }

  $scope.getPropTotal = function() {
    var total = 0;
    for (i = 0; i < $scope.propositions.length; i++) {
        if ($scope.propositions[i].selected) {
            if ($scope.propositions[i].move === 'sell') {
                total += $scope.propositions[i].amount;
            } else {
                total -= $scope.propositions[i].amount;
            }
        }
    }
    return total;
  };

  // Main data model, loaded by the state resolver
  $scope.dataModel = dataModel;
  $scope.clientName = clientName;
  $scope.clientFolioName = Object.keys($scope.dataModel.client)[0];
  $scope.referenceFolioName = Object.keys($scope.dataModel.reference)[0];
  $scope.period;

  // Summary view data model
  $scope.setSummaryData = function() {
    var length= $scope.dataModel.reference[$scope.referenceFolioName].graph.length -1;
    var lastRefPos = $scope.dataModel.reference[$scope.referenceFolioName].graph[length];
    $scope.lcl = {
      value: Math.round(lastRefPos.Value),
      variation: Math.round((lastRefPos.Value - lastRefPos.Invested) * 100 / lastRefPos.Invested),
      volatility: meanSpread($scope.dataModel.reference[$scope.referenceFolioName].graph)
    };
    lenght= $scope.dataModel.client[$scope.clientFolioName].graph-1;
    var lastClientPos = $scope.dataModel.client[$scope.clientFolioName].graph[length];
    $scope.client = {
      value: Math.round(lastClientPos.Value),
      variation: Math.round((lastClientPos.Value - lastClientPos.Invested) * 100 / lastClientPos.Invested),
      volatility: meanSpread($scope.dataModel.client[$scope.clientFolioName].graph)
    };
  }
  $scope.setSummaryData();

  // Graph data model
  $scope.setGraphPeriod = function(period) {
    $scope.period = period;
    var refGraph = $scope.dataModel.reference[$scope.referenceFolioName].graph.slice(-period).reverse();
    var clientGraph = $scope.dataModel.client[$scope.clientFolioName].graph.slice(-period).reverse();
    $scope.graphData = refGraph.map(function(d, i) { return {'date': d.Date, 'lcl': d.Value, 'lclInv': d.Invested, 'client': clientGraph[i].Value, 'clientInv': clientGraph[i].Invested }; })
      .filter(function(d, i) { return !(i % (Math.round(+period / 30))); }).reverse();
  }
  $scope.setGraphPeriod(30);

  // Modify type reference folio
  $scope.modifyReference = function(folio) {
    $scope.referenceFolioName = folio;
    $scope.setGraphPeriod($scope.period);
    $scope.setSummaryData();
  }

  // Groupbars data model
  $scope.setGroupbarData = function() {
    $scope.groupbarData = Object.keys($scope.dataModel.client[$scope.clientFolioName].split)
      .map(function(d, i) { var ret = {}; ret.class = d;
                            ret.split = Math.round($scope.dataModel.client[$scope.clientFolioName].split[d]);
                            ret.splitLCL = Math.round($scope.dataModel.reference[$scope.referenceFolioName].split[d]);
                            return ret; });
    var owners = d3.keys($scope.groupbarData[0]).filter(function(key) { return key !== "class"; });
    $scope.groupbarData.forEach(function(d) {
      d.bars = owners.map(function(name) {
        return {name: name, value: +d[name], bclass: 'bar-' + name + '-' + d.class}; });
    });
  }
  $scope.setGroupbarData();
  $scope.updateGroupbarClassValue = function(investmentClass, classMvt) {
    var currentValue = ($scope.dataModel.client[$scope.clientFolioName].split[investmentClass] / 100) * $scope.client.value;
    $scope.dataModel.client[$scope.clientFolioName].split[investmentClass] = ((currentValue+classMvt) / $scope.client.value) * 100;
    $scope.setGroupbarData();
  }

  // Bars data model
  $scope.setBarData = function(data) {
    $scope.barData = Object.keys(data)
      .map(function(d, i) { var ret = {}; ret.class = d; ret.split = Math.round(data[d]); return ret; });
  }

  $scope.setBarData($scope.dataModel.client[$scope.clientFolioName].split);
  // Tableau data model
  $scope.setTableauData = function(data) {
    $scope.tableauData = data;
  }
  $scope.setTableauData($scope.dataModel.client[$scope.clientFolioName].funds);

  // Date asked for more details
  $scope.changeAskedDate = function(newDate){
      $scope.askedDate = newDate;
  }
  $scope.changeAskedDate('LUNDI 16 NOVEMBRE 2015');

  // Update tableauData, barData and askDate upon click on tooltip
  $scope.updateDetails = function (date){
    details.fetch($scope.clientName, $scope.clientFolioName, date)
    .then(function (res) {
      $scope.setTableauData(res.data.Details);
      var action  = (res.data.Action ? res.data.Action : 0);
      var cash  = (res.data.Cash ? res.data.Cash : 0);
      var obligation  = (res.data.Obligation ? res.data.Obligation : 0);
      var autre  = (res.data.Autre ? res.data.Autre : 0);
      var split = { Action :  action, Autre : autre,Cash : cash, Obligation : obligation};
      $scope.setBarData(split);
      var _date = new Date(date);
      $scope.changeAskedDate(dayNames[_date.getDay()] + ' ' + _date.getDate() + ' ' + monthNames[_date.getMonth()] + ' ' + _date.getFullYear())
    });
  }

  // Date data model
  $scope.changeCurrent= function(newDate){
    $scope.currentDate = newDate;
  }
  $scope.changeCurrent('LUNDI 16 NOVEMBRE 2015');

  // Propositions data model
  $scope.propositions = [{
    selected: false,
    title: "LCL vous propose de transférer 10 000 € de monétaire vers actions Asie",
    content: "Les marchés d'actions ont fortement rebondi en octobre, encouragés en particulier par l'apparition de signes de stabilisation de la conjoncture chinoise et par la perspective d'une extension des mesures de politique monétaire de la BCE. Le rebond a été particulièrement fort en zone euro. Les indices américains ses sont également bien comportés, la perspective renforcée d'une hausse de taux directeurs de la Réserve Fédérale étant interprêtée comme un signe de confiance concernant l'économie.",
    Action: +10000, Cash: -10000, Obligation: 0, Autre: 0,
    move: 'buy', name: 'China Mobile LTD', isin: 'HK65467816', shares: 15, fee: 1.5, amount: 10000
  }, {
    title: "LCL vous propose de transférer 6 000 € de monétaire vers actions Asie",
    content: "Les marchés d'actions ont fortement rebondi en octobre, encouragés en particulier par l'apparition de signes de stabilisation de la conjoncture chinoise et par la perspective d'une extension des mesures de politique monétaire de la BCE. Le rebond a été particulièrement fort en zone euro. Les indices américains ses sont également bien comportés, la perspective renforcée d'une hausse de taux directeurs de la Réserve Fédérale étant interprêtée comme un signe de confiance concernant l'économie.",
    Action: +6000, Cash: -6000, Obligation: 0, Autre: 0,
    move: 'buy', name: 'Tencent Holdings LTD', isin: 'HK5949181045', shares: 9, fee: 1, amount: 6000
  }, {
    title: "LCL vous propose de transférer 6 000 € de monétaire vers actions US",
    content: "Les marchés d'actions ont fortement rebondi en octobre, encouragés en particulier par l'apparition de signes de stabilisation de la conjoncture chinoise et par la perspective d'une extension des mesures de politique monétaire de la BCE. Le rebond a été particulièrement fort en zone euro. Les indices américains ses sont également bien comportés, la perspective renforcée d'une hausse de taux directeurs de la Réserve Fédérale étant interprêtée comme un signe de confiance concernant l'économie.",
    Action: +6000, Cash: -6000, Obligation: 0, Autre: 0,
    move: 'buy', name: 'Amundi Funds Equity US', isin: 'US5949181045', shares: 13, fee: 1.5, amount: 6000
  }, {
    title: "LCL vous propose de vendre 5 000 € de warrant Europe",
    content: "Les marchés d'actions ont fortement rebondi en octobre, encouragés en particulier par l'apparition de signes de stabilisation de la conjoncture chinoise et par la perspective d'une extension des mesures de politique monétaire de la BCE. Le rebond a été particulièrement fort en zone euro. Les indices américains ses sont également bien comportés, la perspective renforcée d'une hausse de taux directeurs de la Réserve Fédérale étant interprêtée comme un signe de confiance concernant l'économie.",
    Action: +5000, Cash: 0, Obligation: 0, Autre: -5000,
    move: 'sell', name: 'Call Warrant Renault', isin: 'FR91010845', shares: 5, fee: 2, amount: 5000
  }, {
    title: "LCL vous propose de transférer 2 000 € de warrant vers actions Europe",
    content: "Les marchés d'actions ont fortement rebondi en octobre, encouragés en particulier par l'apparition de signes de stabilisation de la conjoncture chinoise et par la perspective d'une extension des mesures de politique monétaire de la BCE. Le rebond a été particulièrement fort en zone euro. Les indices américains ses sont également bien comportés, la perspective renforcée d'une hausse de taux directeurs de la Réserve Fédérale étant interprêtée comme un signe de confiance concernant l'économie.",
    Action: +2000, Cash: 0, Obligation: 0, Autre: -2000,
    move: 'buy', name: 'Actions & OPCVM', isin: 'FR5949997845', shares: 9, fee: 1, amount: 2000
  }];

  // Slides data model
  $scope.activeSlide  = 0;

  // Profiles data model
  $scope.profiles = [ { text: "Dynamique", folio: "Dynamique",  id: 2, pclass: "profile-orange"},
                      { text: "Prudent", folio:"Prudent",   id: 0, pclass: "profile-green" },
                      { text: "Equilibré", folio:"Prudent", id: 1, pclass: "profile-blue"},
                      { text: "Offensif", folio:"Dynamique",   id: 3, pclass: "profile-red" }];
  $scope.profileClicked = function (index) {
    // Remove element
    var el = $scope.profiles[index];
    $scope.modifyReference(el.folio);
    $scope.profiles.splice(index, 1);
    // Re-sort array
    $scope.profiles.sort(function (a, b) { return +a.id - +b.id; });
    // Finally push selected on top
    $scope.profiles.unshift(el);
    // Retract menu
    document.getElementById("profile").checked = false;
    //Send event to portefolio to change graph
    console.log('profile clicked to ' + $scope.profiles[0].text);
    $rootScope.newVal = $scope.profiles[0].text;

  };

  // Panes data model
  $scope.bottomPane = { left: "", right: "" };

  // Modal data model
  $ionicModal.fromTemplateUrl('templates/optimize-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.showModal = function () {
    // Clear all acks on props
    var numOfProps = 0;
    for (var i = 0; i < $scope.propositions.length; i++) {
        if ($scope.propositions[i].selected) numOfProps++;
        $scope.propositions[i].acked = false;
    }
    $scope.modalAllAcked = false;

    // Prepare modal size
    console.log("N p="+numOfProps);
    var h = 340 + 145 * numOfProps;

    var modalDiv = document.getElementsByClassName("modal");
    $timeout(function(){modalDiv[0].style.height = h + "px";});

    // Then show modal
    $scope.modal.show();
  };
  $scope.closeModal = function () {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function () {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function () {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function () {
    // Execute action
  });

  // Modal to call us

  $ionicModal.fromTemplateUrl('templates/phone-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (phone) {
    $scope.phone = phone;
  });

  $scope.showPhone = function () {
    $scope.phone.show();
  };

  $scope.hidePhone = function () {
    $scope.phone.hide();
  };

  function meanSpread(series) {
    var mean = series.reduce(function(a, b) { return a + +b.Value; }, 0) / series.length;
    var spread = Math.pow(series.reduce(function(a, b) { return a + Math.pow(+b.Value - mean, 2)}, 0) / series.length, 0.5);
    return Math.round(spread / mean * 100);
  }
});
