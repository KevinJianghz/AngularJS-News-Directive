'use strict';

var app = angular.module('myApp', ['news.directives']);

app.controller('newsCtrl', ['$scope', function($scope) {
  $scope.newsUrl = 'http://www.npr.org/rss/rss.php?id=1006';
  $scope.showInterval = 4000;
}]);

