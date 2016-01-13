var home_module = angular.module('HomeModule', [

]);

home_module.controller('HomeCtrl', function($scope) {
    $scope.message = 'Home';
});