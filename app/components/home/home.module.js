var home_module = angular.module('HomeModule', []);

home_module.controller('HomeCtrl',
	function(DashboardService, $state, $scope, $rootScope) {
		DashboardService.update_dashboard();

		$scope.counter = $rootScope.counter;
		//console.log(this.counter);
		$scope.data = {
			sample_due: {},
			sample_received: {},
			verified: {},
			to_be_verified: {},
			published: {},
			};

		$scope.$watch('counter.sample_due',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
					$scope.data.sample_due = {
						_type : "terms",
						terms:[{
							term: 'Due',
							count: $scope.counter.sample_due,
						},{
							term: 'Other',
							count: $scope.counter.active - $scope.counter.sample_due,
						}]
					}
			});

		$scope.$watch('counter.sample_received',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
					$scope.data.sample_received = {
						_type : "terms",
						terms:[{
							term: 'Received',
							count: $scope.counter.sample_received,
						},{
							term: 'Other',
							count: $scope.counter.active - $scope.counter.sample_received,
						}]
					}
			});

		$scope.$watch('counter.to_be_verified',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
					$scope.data.to_be_verified = {
						_type : "terms",
						terms:[{
							term: 'To be verified',
							count: $scope.counter.to_be_verified,
						},{
							term: 'Other',
							count: $scope.counter.active - $scope.counter.to_be_verified,
						}]
					}
			});

		$scope.$watch('counter.verified',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
					$scope.data.verified = {
						_type : "terms",
						terms:[{
							term: 'Verified',
							count: $scope.counter.to_be_verified,
						},{
							term: 'Other',
							count: $scope.counter.active - $scope.counter.verified,
						}]
					}
			});

		$scope.$watch('counter.published',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
					$scope.data.published = {
						_type : "terms",
						terms:[{
							term: 'Published',
							count: $scope.counter.published,
						},{
							term: 'Other',
							count: $scope.counter.active - $scope.counter.published,
						}]
					}
			});



		 var resultsA = {
        	facets: {
    			Product : {
      				_type : "terms",
      				missing : 0,
      				total : 454,
      				other : 0,
      				terms : [{
        				term : "Prod-A",
        				count : 306
      				},{
        				term : "Prod-B",
        				count : 148
      				},{
      					term : "Prod-C",
      					count : 62
      				}]
    			},
    			Sex : {
      				_type : "terms",
      				missing : 0,
      				total : 454,
      				other : 0,
      				terms : [{
        				term : "Male",
        				count : 36
      				},{
        				term : "Female",
        				count : 148
      				}]
    			},
        		Times : {
        			_type: "date_histogram",
	        		entries : [{
	        			time : 1341100800000,
	        			count : 9
	      			}, {
	        			time : 1343779200000,
	        			count : 32
	      			}, {
	        			time : 1346457600000,
	        			count : 78
	      			}, {
	        			time : 1349049600000,
	        			count : 45
	      			}, {
	        			time : 1351728000000,
	        			count : 134
	      			}]
        		}
        	}
        };

        var resultsB = {
        	facets: {
    			Product : {
      				_type : "terms",
      				missing : 0,
      				total : 454,
      				other : 0,
      				terms : [{
        				term : "Prod-A",
        				count : 306
      				},{
        				term : "Prod-B",
        				count : 148
      				},{
                        term : "Prod-C",
                        count : 0
                    }]
    			},
    			Sex : {
      				_type : "terms",
      				missing : 0,
      				total : 454,
      				other : 0,
      				terms : [{
        				term : "Male",
        				count : 36
      				}]
    			},
        		Times : {
        			_type: "date_histogram",
	        		entries : [{
	        			time : 1341100800000,
	        			count : 9
	      			}, {
	        			time : 1343779200000,
	        			count : 32
	      			}, {
	        			time : 1346457600000,
	        			count : 78
	      			}]
        		}
        	}
        };

        $scope.filterSearchA = function(type, term) {
            switch(currentResults) {
                case 'A':
                    $scope.results = resultsB;
                    currentResults = 'B';
                    break;
                case 'B':
                    $scope.results = resultsA;
                    currentResults = 'A';
                    break;
            }
        };

        $scope.results = resultsA;
        var currentResults = 'A';


});