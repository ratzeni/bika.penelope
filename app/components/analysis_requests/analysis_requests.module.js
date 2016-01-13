var analysis_requests_module = angular.module('AnalysisRequestsModule',[]);

analysis_requests_module.run(function($rootScope){
  $rootScope._ = _;
});

analysis_requests_module.controller('AnalysisRequestsCtrl',
	function(BikaService, DashboardService, Utility, config, $scope, $rootScope) {

		$scope.analyses = []
		$scope.analysis_requests = [];
		$scope.checked_list = [];
		$scope.review_state = 'sample_due';
		$scope.stickers={id:null};

        $scope.loading_ars = Utility.loading({
            busyText: 'Wait while loading analyses...',
            delayHide: 500,
        });

        $scope.loading_change_review_state =
        	function(text) {
        		params = {
	        		busyText: text===undefined?'Wait...':'Wait while ' + text + '...',
            		delayHide: 500,
            		theme: 'warning',
        		}
        		return Utility.loading(params);
        	};

		$scope.getAnalysisRequests =
            function(review_state, print_stickers) {
            	$scope.loading_ars.show();
            	$scope.review_state = review_state;
                $scope.analysis_requests = [];
                params = {sort_on: 'Date', sort_order: 'descending', review_state: review_state};
                BikaService.getAnalysisRequests(params).success(function (data, status, header, config){
                    $scope.analysis_requests = data.result;
                    transitions = Array();
					_.each($scope.analysis_requests,function(obj) {
						Utility.merge(transitions,obj.transitions,'id');
					});

                    $scope.transitions = transitions;
                    $scope.loading_ars.hide();
                    if (print_stickers !==undefined && print_stickers === true) {
                    	Utility.print_stickers($scope.batch.path,$scope.stickers.id);
                    }
                    $rootScope.counter = DashboardService.update_dashboard();
                });
            };

        $scope.sort = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}

		$scope.getAnalysisRequests($scope.review_state);

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

		this.toggle = function(id) {
				var idx = $scope.checked_list.indexOf(id);
				if (idx > -1) {
					$scope.checked_list.splice(idx, 1);
				}
				else {
					$scope.checked_list.push(id);
				}
				//console.log($scope.checked_list);
			}

		$scope.cancelAnalysisRequest =
			function(id) {
				$scope.loading_change_review_state('deleting analysis requests').show();
				params = {ids: id};
				BikaService.cancelAnalysisRequest(params).success(function (data, status, header, config){
					$scope.checked_list = [];
					$scope.loading_change_review_state('deleting analysis requests').hide();
					$scope.getAnalysisRequests($scope.review_state);
				});

			}

		$scope.reinstateAnalysisRequest =
			function(id) {
				$scope.loading_change_review_state('reinstating analysis requests').show();
				params = {ids: id};
				BikaService.reinstateAnalysisRequest(params).success(function (data, status, header, config){
				 	$scope.checked_list = [];
				 	$scope.loading_change_review_state('reinstating analysis requests').hide();
				 	$scope.getAnalysisRequests($scope.review_state);
				 });

			}

		$scope.receiveSample =
			function(id) {
				$scope.loading_change_review_state('receiving samples').show();
				params = {ids: id};
				$scope.stickers.id=id;
				BikaService.receiveSample(params).success(function (data, status, header, config){
					//console.log(data);
					$scope.checked_list = [];
					$scope.loading_change_review_state('receiving samples').hide();
					$scope.getAnalysisRequests($scope.review_state, true);

				});

			}

		this.change_review_state =
			function (action, id) {
				if (id === undefined) {
					var id = $scope.checked_list.join('|');
				}
				if (action === 'receive') {
					$scope.receiveSample(id);
				}
				else if (action === 'cancel') {
					 $scope.cancelAnalysisRequest(id);
				}
				else if (action === 'reinstate') {
					 $scope.reinstateAnalysisRequest(id);
				}
			}

	});

analysis_requests_module.controller('AnalysisRequestDetailsCtrl',
	function(BikaService, DashboardService, Utility, config, $stateParams, $scope, $rootScope) {

		$scope.state = {analysis_request_id: $stateParams.analysis_request_id};
		$scope.analysis_request = null;

		$scope.loading_ars = Utility.loading({
            busyText: 'Wait while loading analyses...',
            delayHide: 500,
        });

		$scope.getAnalysisRequests =
            function(analysis_request_id) {
            	$scope.loading_ars.show();
                params = {id: analysis_request_id};
                BikaService.getAnalysisRequests(params).success(function (data, status, header, config){
                    $scope.analysis_request = data.result[0];
                    $scope.loading_ars.hide();
                    //$rootScope.counter = DashboardService.update_dashboard();
                });
            };

		$scope.getAnalysisRequests($scope.state.analysis_request_id);

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

});