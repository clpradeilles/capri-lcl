angular.module('ionicCapri')

.directive('tableau', function($window){
  return{
    restrict:'EA',
    templateUrl:"templates/tableau.html",
    require: 'ngModel'
  }
});
