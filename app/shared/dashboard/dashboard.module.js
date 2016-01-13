var dashboard_module = angular.module('DashboardModule',[]);

dashboard_module.run(function($rootScope){
  	$rootScope._ = _;
  	$rootScope.counter = {
			sample_due: 0,
			sample_received: 0,
			verified: 0,
			published: 0,
			assigned: 0,
			run: false,
	}

});

dashboard_module.service('DashboardService', function(BikaService, $rootScope) {
		var counter = $rootScope.counter;

 		this.samples_review_state = ['sample_due','sample_received'];
		this.ars_review_state = ['published','verified'];
		this.services_review_state = ['to_be_verified'];

		update_counter =
			function (review_state, count, counter) {
				counter[review_state] = count;
			}

		countAnalysisRequests =
			function(review_state) {
                params = {sort_on: 'id', sort_order: 'descending', review_state: review_state, include_fields: 'path'};
                BikaService.countAnalysisRequests(params).success(function (data, status, header, config){
					var count = data.result;
					update_counter(review_state, count, counter);
                });
		}

		countSamples =
			function(review_state) {
                params = {sort_on: 'id', sort_order: 'descending', review_state: review_state, include_fields: 'path'};
                BikaService.countSamples(params).success(function (data, status, header, config){
					var count = data.result;
					update_counter(review_state, count, counter);
                });
			}


		this.update_dashboard =
			function () {
				_.each(this.ars_review_state,function(review_state) {
					update_counter(review_state, -1, $rootScope.counter);
					countAnalysisRequests(review_state);
				});
				_.each(this.samples_review_state,function(review_state) {
					update_counter(review_state, -1, $rootScope.counter);
					countSamples(review_state);
				});
				return counter;
			}

		return this;
})
.controller('DashboardCtrl',
	function(DashboardService, $state, $scope, $rootScope) {

		/*if ($state.current.name!=='login') {
			$rootScope.counter = DashboardService.update_dashboard();
		}*/

		this.refresh = function() {
			$rootScope.counter = DashboardService.update_dashboard();
		}

});