var blackboard_module = angular.module('BlackBoardModule',[]);

analysis_requests_module.run(function($rootScope){
  $rootScope._ = _;
});

blackboard_module.controller('BlackBoardCtrl',
	function(BikaService, DashboardService, Utility, config, ngCart, $scope, $stateParams, $rootScope) {

		this.format_date =
			function(date) {
				return Utility.format_date(date);
			}

		this.format_review_state =
			function(review_state) {
				return Utility.format_review_state(review_state);
			}

		this.format_result =
			function(result) {
				return Utility.format_result(result);
			}

		this.check_transitions = function(id_transition, transitions) {
			if (transitions === undefined) {
				var transitions = $scope.transitions;
			}
			return Utility.check_transitions(id_transition, transitions);
		}
});