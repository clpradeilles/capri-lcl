angular.module('ionicCapri')

.factory('portfolios', function($q, $http) {
  return {
    fetch: function(owners) {
      var d = $q.defer();
      var data = {};
      async.map(owners, function(it, callback) {
        async.series([
          function(callback) { // get portfolio names
            $http.get('https://capri-historic-v2.eu-gb.mybluemix.net/api/portfolios/' + it.value)
            .then(function(response) { data[it.name] = response.data.reduce(function(p, c, i) { p[c.Name] = {}; return p; }, {}); callback(); },
                  function(error)    { callback(error); });
          }, function(callback) { // get reference graphs
            async.forEachOf(data[it.name], function(item, key, callback) {
              $http.get('https://capri-historic-v2.eu-gb.mybluemix.net/api/portfolios/' + it.value + '/' + key + '/historic')
              .then(function(response) { item.graph = response.data; callback(); },
                    function(error)    { callback(error); });
            }, callback);
          }, function(callback) { // get details & splits for last date in graph
            //console.log('interime data: ' + JSON.stringify(data));
            async.forEachOf(data[it.name], function(item, key, callback) {
              var date = item.graph.slice(-1).pop().Date;
              $http.get('https://capri-historic-v2.eu-gb.mybluemix.net/api/portfolios/' + it.value + '/' + key + '/details?date=' + date)
              .then(function(response) { item.funds = response.data.Details; delete response.data.Details; item.split = response.data; callback(); },
                    function(error)    { callback(error); });
            }, callback);
          }
        ], callback)
      }, function(err) {
        err ? d.reject(err) : d.resolve(data);
      })
      return d.promise;
    }
  }
});


      // start fetching all splits & details
      /*function(callback) {
        async.map(data.reference, function(item, callback) {
          var dates = item.graph.map(function(e) { return e.Date});
          async.each(dates, function(subitem, callback) {
            console.log('subitem: ' + JSON.stringify(subitem));
            $http.get('https://capri-historic-v2.eu-gb.mybluemix.net/api/portfolios/LCL/' + item.Name + '/details?date=' + subitem)
            .then(function(response) {
              console.log('response: ' + JSON.stringify(response));
              callback(null, item);
            }, function(error) {
              callback(error);
            });
          }, callback);
        }, callback);
      }*/
