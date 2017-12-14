(function() {
  "use strict";

  
  var loginAlrtCtrl = function($scope, $modal, $modalInstance){

    function DialogDemoCtrl($scope, $modal){
    
        $scope.data = {
          boldTextTitle: "You must Sign In to use this feature",
          mode : 'warning'
        };
    
      $scope.open = function (mode) {
    
        $scope.data.mode = mode;
    
        var modalInstance = $modal.open({
          templateUrl: 'login-alert.html',
          controller: ModalInstanceCtrl,
          backdrop: true,
          keyboard: true,
          backdropClick: true,
          size: 'lg',
          resolve: {
            data: function () {
              return $scope.data;
            }
          }
        });
    
      };
    
    }
    
    var ModalInstanceCtrl = function ($scope, $modalInstance, data) {
      $scope.data = data;
      $scope.close = function(/*result*/){
        $modalInstance.close($scope.data);
      };
    };

  };

  loginAlrtCtrl.$inject = ['$scope', '$modal', '$modalInstance'];
  angular.module("SongSearchApp").controller("loginAlrtCtrl", loginAlrtCtrl);
})();