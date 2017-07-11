angular.module('ionicCapri')
.factory('details', function($q, $http) {
  return {
    fetch: function(owner, portName, date) {
      return $http.get('https://capri-historic-v2.eu-gb.mybluemix.net/api/portfolios/' + owner + '/' + portName + '/details?date='+date)
        .then(function(response) {
          return response;
        }, function(response) {
          console.log('Error data: ' + JSON.stringify(response.status));
        });
    }
  }
});
