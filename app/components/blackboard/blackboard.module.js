var blackboard_module = angular.module('BlackBoardModule',[]);

analysis_requests_module.run(function($rootScope){
  $rootScope._ = _;
});

blackboard_module.controller('BlackBoardCtrl',
	function(BikaService, DashboardService, Utility, config, ngCart, $scope, $state, $stateParams, $rootScope) {


		$scope.analysis_requests = [];
		$scope.analysis_results = [];
		$scope.checked_list = [];
		$scope.stickers={id:null};

		$scope.submit_params = {analyses: []};
		$scope.verify_params = {analyses: []};
		$scope.publish_params = {analyses: []};
		$scope.analyses = [];

		$scope.csv = {sample_list: []};

		this.in_blackboard_page = true;

		$scope.loading_change_review_state =
        	function(text) {
        		params = {
	        		busyText: text===undefined?'Wait...':'Wait while ' + text + '...',
            		delayHide: 500,
            		theme: 'warning',
        		}
        		return Utility.loading(params);
        	};


		$scope.init =
			function() {
				transitions = Array();
                workflow_transitions = Array();
                analyses = Array();
                $scope.csv.sample_list = Array();
				_.each(ngCart.getItems(), function(item) {
					$scope.csv.sample_list.push({sample: item.getData().sample_id+'|'+item.getData().client_sample_id})
					Utility.merge(transitions,item.getData().transitions,'id');
					Utility.merge(analyses, item.getData().analyses, 'id');
					$scope.analysis_results[item.getData().id] = [];
					_.each(item.getData().analyses, function(a) {
						Utility.merge(workflow_transitions, a.transitions, 'id');
						$scope.analysis_results[item.getData().id][a.id] = (a.review_state === 'sample_received')?1:a.result;
					});

				});
				$scope.transitions = transitions;
                $scope.workflow_transitions = workflow_transitions;
                $scope.analyses = analyses;
			}
		$scope.init();

		$scope.sort = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
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

		this.results = config.legend.analysis_result;


		$scope.updateAnalysisRequests =
			function(id, print_stickers) {
				params = {ids: id};
				BikaService.getAnalysisRequests(params).success(function (data, status, header, config){
				 	analysis_requests = data.result.objects;
				 	_.each(analysis_requests, function(ar) {
				 		if (ngCart.getItemById(ar.id) !== false ) {
							ngCart.removeItemById(ar.id);
							ngCart.addItem(ar.id,ar.id,1,1,ar);
						}
				 	});

					$scope.init();
				 	if (print_stickers !==undefined && print_stickers === true) {Utility.print_stickers($scope.stickers.id);}
                    $rootScope.counter = DashboardService.update_dashboard();
				 });
			}

		$scope.cancelAnalysisRequest =
			function(id) {
				$scope.loading_change_review_state('deleting analysis requests').show();
				params = {ids: id};
				BikaService.cancelAnalysisRequest(params).success(function (data, status, header, config){
					$scope.checked_list = [];
					$scope.loading_change_review_state('deleting analysis requests').hide();
					$scope.updateAnalysisRequests(id);
				});

			}

		$scope.reinstateAnalysisRequest =
			function(id) {
				$scope.loading_change_review_state('reinstating analysis requests').show();
				params = {ids: id};

				BikaService.reinstateAnalysisRequest(params).success(function (data, status, header, config){
				 	$scope.checked_list = [];
				 	$scope.loading_change_review_state('reinstating analysis requests').hide();
				 	$scope.updateAnalysisRequests(id);
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
					$scope.updateAnalysisRequests(id, true);

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


		$scope.submit =
			function(request_id, analysis_id) {
				if (Array.isArray(request_id) && request_id.length == 0) {
					Utility.alert({title:'Nothing to submit<br/>', content:'Please select at least a Sample', alertType:'warning'});
					return;
				}
				if (Array.isArray(request_id) && request_id.length == 0) {
					Utility.alert({title:'Nothing to submit<br/>', content:'Please select at least a Analysis', alertType:'warning'});
					return;
				}
				$scope.loading_change_review_state('submitting').show();
				params = {input_values: $scope._get_input_values(request_id, analysis_id)};
				//console.log(params);
				BikaService.setAnalysesResults(params).success(function (data, status, header, config){
				 	result = data.result;
				 	//console.log(result);
				 	if (result.success === 'True') {
				 		params = {f: $scope._get_action_params(request_id, analysis_id)}
				 		//console.log(params);

				 		BikaService.submit(params).success(function (data, status, header, config){
				 			result = data.result;
				 			//console.log(result);
				 			$scope.checked_list = [];
				 			$scope.submit_params = {analyses: []};
				 			$scope.loading_change_review_state('submitting').hide();
				 			$scope.updateAnalysisRequests(request_id);
				 		});
				 	}
				});
			}

		$scope.verify =
			function(request_id, analysis_id) {
				if (Array.isArray(request_id) && request_id.length == 0) {
					Utility.alert({title:'Nothing to verify<br/>', content:'Please select at least a Sample', alertType:'warning'});
					return;
				}
				if (Array.isArray(analysis_id) && analysis_id.length == 0) {
					Utility.alert({title:'Nothing to verify<br/>', content:'Please select at least a Analysis', alertType:'warning'});
					return;
				}
				$scope.loading_change_review_state('verifying').show();
				params = {f: $scope._get_action_params(request_id, analysis_id)}
				//console.log(params);

				BikaService.verify(params).success(function (data, status, header, config){
					result = data.result;
					//console.log(result);
					$scope.checked_list = [];
					$scope.verify_params = {analyses: []};
					$scope.loading_change_review_state('verifying').hide();
					$scope.updateAnalysisRequests(request_id);
				 });
			}

		$scope.publish =
			function(request_id, analysis_id) {
				if (Array.isArray(request_id) && request_id.length == 0) {
					Utility.alert({title:'Nothing to publish<br/>', content:'Please select at least a Sample', alertType:'warning'});
					return;
				}
				if (Array.isArray(analysis_id) && analysis_id.length == 0) {
					Utility.alert({title:'Nothing to publish<br/>', content:'Please select at least a Analysis', alertType:'warning'});
					return;
				}
				$scope.loading_change_review_state('publishing').show();
				params = {f: $scope._get_action_params(request_id, analysis_id,'publish')}
				//console.log(params);

				BikaService.publish(params).success(function (data, status, header, config){
					result = data.result;
					//console.log(result);
					$scope.checked_list = [];
					$scope.publish_params = {analyses: []};
					$scope.loading_change_review_state('publishing').hide();
					$scope.updateAnalysisRequests(request_id);
				 });
			}


		$scope._get_action_params =
			function(request_id, analysis_id, action) {
				if (!Array.isArray(request_id) && !Array.isArray(analysis_id)) {
					var f = []
					f.push($scope._get_analysis_path(request_id, analysis_id));
					return JSON.stringify(f);
				}
				else if (Array.isArray(request_id) && Array.isArray(analysis_id)) {
					var f = []
					_.each(request_id,function(request_obj) {
						if (action !== undefined && action=='publish') {
							f.push($scope._get_analysis_path(request_obj));
						}
						_.each(analysis_id,function(analysis_obj) {
							f.push($scope._get_analysis_path(request_obj, analysis_obj.id));
						});
					});
					return JSON.stringify(f);
				}

			}

		$scope._get_input_values =
			function (request_id, analysis_id) {
				if (!Array.isArray(request_id) && !Array.isArray(analysis_id)) {
					var input_values = {};
					input_values[$scope._get_analysis_path(request_id,analysis_id)] = {Result: $scope._get_analysis_result(request_id, analysis_id)}
					return JSON.stringify(input_values);
				}
				else if (Array.isArray(request_id) && Array.isArray(analysis_id)) {
					var input_values = {};
					_.each(request_id,function(request_obj) {
						_.each(analysis_id,function(analysis_obj) {
							input_values[$scope._get_analysis_path(request_obj,analysis_obj.id)] = {Result: $scope._get_analysis_result(request_obj, analysis_obj.id)}
						});
					});
					return JSON.stringify(input_values);
				}
			}

		$scope._get_analysis_path =
			function(request_id, analysis_id) {
				request = ngCart.getItemById(request_id);
				if (analysis_id === undefined) {
					return request.getData().path;
				}
				else {return request.getData().path + "/" + analysis_id;}

			}

		$scope._get_analysis_result =
			function(request_id, analysis_id) {
				return $scope.analysis_results[request_id][analysis_id].toString();
			}

		this.change_workflow_review_state =
			function (action, request_id, analysis_id) {

				if (action === 'submit') {
					 $scope.submit(request_id, analysis_id);
				}
				else if (action === 'verify') {
					 $scope.verify(request_id, analysis_id);
				}
				else if (action === 'assign') {
					 $scope.assign(request_id, analysis_id);
				}
				else if (action === 'publish') {
					 $scope.publish(request_id, analysis_id);
				}

			}

		this.remove_from_blackboard =
			function(ids) {
				if (!Array.isArray(ids)) {
					ids =[ids];

				}
				_.each(ids,function(id) {
					if (ngCart.getItemById(id) !== false ) {
						//var ar = _.findWhere($scope.analysis_requests, {'id': id});
						ngCart.removeItemById(id);
					}
				});
				$scope.init();
				$scope.checked_list = [];
		}


		this.get_filename =
			function () {
				return 'sample_list.'+Utility.format_date()+'.csv'
			}


});