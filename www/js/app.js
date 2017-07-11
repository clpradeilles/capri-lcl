angular.module('ionicCapri', ['ionic'])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('app', {
    url: "/app",
    abstract: true,
    views: {
      'app': {
        templateUrl: "templates/app.html",
        controller: "AppCtrl",
        resolve: {
          dataModel: function(portfolios) {
            return portfolios.fetch([{'name': 'reference', 'value': 'LCL'}, {'name': 'client', 'value': 'Owner1'}]);
          },
          clientName: function() {
            return 'Owner1';
          }
        }
      }
    }
  }).state('app.details', {
    url: "/details",
    views: {
      'details' :{
        templateUrl: "templates/details.html",
        controller : "portfolioCtrl"
      }
    }
  })
  $urlRouterProvider.otherwise("/app/details");
})
