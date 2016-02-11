var home_module = angular.module('HomeModule', []);

home_module.controller('HomeCtrl',
	function(DashboardService, Utility, $state, $scope, $rootScope) {
		DashboardService.update_dashboard();

		$scope.counter = $rootScope.counter;

		$scope.$watch('counter.sample_due',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
					radialProgress(document.getElementById('divSampleDue'))
						.diameter(200)
						.value(Utility.percentage($scope.counter.sample_due, $scope.counter.active))
						.render();
			});

		$scope.$watch('counter.sample_received',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
					radialProgress(document.getElementById('divSampleReceived'))
						.diameter(200)
						.value(Utility.percentage($scope.counter.sample_received, $scope.counter.active))
						.render();
			});

		$scope.$watch('counter.to_be_verified',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}

					radialProgress(document.getElementById('divToBeVerified'))
						.diameter(200)
						.value(Utility.percentage($scope.counter.to_be_verified, $scope.counter.active))
						.render();
			});

		$scope.$watch('counter.verified',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}

					radialProgress(document.getElementById('divVerified'))
						.diameter(200)
						.value(Utility.percentage($scope.counter.verified, $scope.counter.active))
						.render();
			});

		$scope.$watch('counter.published',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}

					radialProgress(document.getElementById('divPublished'))
						.diameter(200)
						.value(Utility.percentage($scope.counter.published, $scope.counter.active))
						.render();

			});

});