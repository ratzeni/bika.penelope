var worksheets_module = angular.module('WorksheetsModule',[]);

worksheets_module.run(function($rootScope){
  $rootScope._ = _;
});

worksheets_module.controller('WorksheetsCtrl',
	function(BikaService, Utility, DashboardService, config, ngCart, $scope, $rootScope) {

		$scope.loading_search = Utility.loading({
            busyText: 'Wait while searching worksheets...',
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

		$scope.checked_list = [];
		$scope.review_state = 'open';

		$scope.pagination= {
			page_nr: 0,
			page_size: 10,
			total: 0,
			current: 1,
			last: 0,
		};

		this.changePage = function(newPageNumber, oldPageNumber) {
			if (newPageNumber !== undefined) {
				$scope.pagination.page_nr = newPageNumber-1;
				$scope.pagination.current = newPageNumber;
			}
			$scope.getBatches($scope.review_state);
		}

		// :: function :: getWorksheets()
        $scope.getWorksheets =
            function(review_state) {
            	$scope.loading_search.show();
            	$scope.review_state = review_state;
                $scope.worksheets = [];
                params = {sort_on: 'Date', sort_order: 'descending', review_state: review_state,
                	page_nr: $scope.pagination.page_nr, page_size: $scope.pagination.page_size};

                BikaService.getWorksheets(params).success(function (data, status, header, config){
                    $scope.worksheets = data.result.objects;
                    $scope.pagination.total = data.result.total;
                    $scope.pagination.last = data.result.last;
					transitions = Array();
					_.each($scope.worksheets,function(obj) {
						if (obj.transitions.length > 0) {
							Utility.merge(transitions,obj.transitions,'id');
						}
						else {
							Utility.merge(transitions,[{'id': obj.review_state}], 'id');
						}

					});
                    $scope.transitions = transitions;
					$scope.loading_search.hide();
					$rootScope.counter = DashboardService.update_dashboard();
                });
            };

        $scope.getWorksheets($scope.review_state);

        this.format_date =
			function(date) {
				return Utility.format_date(date);
			};

		this.format_review_state =
			function(review_state) {
				return Utility.format_review_state(review_state);
			};

		this.check_transitions =
			function(id_transition, transitions) {
				if (transitions === undefined) {
					var transitions = $scope.transitions;
				}
				return Utility.check_transitions(id_transition, transitions);
		}

		this.toggle =
			function(id) {
				var idx = $scope.checked_list.indexOf(id);
				if (idx > -1) {
					$scope.checked_list.splice(idx, 1);
				}
				else {
					$scope.checked_list.push(id);
				}
				//console.log($scope.checked_list);
			}

		this.toggle_all = function() {
				if ($scope.checked_list.length < $scope.worksheets.length) {
					_.each($scope.worksheets,function(b) {
						$scope.checked_list.push(b.id);
					})
				}
				else {
					$scope.checked_list = [];
				}
		}


		$scope.closeWorksheet =
			function(worksheet_id) {
				$scope.loading_change_review_state('closing worksheets').show();
				params = {ids: worksheet_id};
				BikaService.closeWorksheet(params).success(function (data, status, header, config){
					$scope.loading_change_review_state('closing worksheets').hide();
					$scope.checked_list = [];
				 	$scope.getWorksheets($scope.review_state);
				});

			}

		$scope.openWorksheet =
			function(worksheet_id) {
				$scope.loading_change_review_state('opening worksheets').show();
				params = {ids: worksheet_id};
				BikaService.openWorksheet(params).success(function (data, status, header, config){
					$scope.loading_change_review_state('opening worksheets').hide();
					$scope.checked_list = [];
				 	$scope.getWorksheets($scope.review_state);
				});


			}

		$scope.cancelWorksheet =
			function(worksheet_id) {
				$scope.loading_change_review_state('deleting worksheets').show();
				params = {ids: worksheet_id};
				BikaService.cancelWorksheet(params).success(function (data, status, header, config){
					$scope.loading_change_review_state('deleting worksheets').hide();
					$scope.checked_list = [];
				 	$scope.getWorksheets($scope.review_state);
				});

			}

		$scope.reinstateWorksheet =
			function(worksheet_id) {
				$scope.loading_change_review_state('reinstating worksheets').show();
				params = {ids: batch_id};
				BikaService.reinstateWorksheet(params).success(function (data, status, header, config){
					$scope.loading_change_review_state('reinstating worksheets').hide();
					$scope.checked_list = [];
				 	$scope.getWorksheets($scope.review_state);
				});

			}




		this.change_review_state =
			function (action, worksheet_id) {
				if (worksheet_id === undefined) {
					var worksheet_id = $scope.checked_list.join('|');
				}

				if (action === 'close') {
					 $scope.closeWorksheet(worksheet_id);
				}
				else if (action === 'open') {
					 $scope.openBatch(worksheet_id);
				}
				else if (action === 'cancel') {
					 $scope.cancelWorksheet(worksheet_id);
				}
				else if (action === 'reinstate') {
					 $scope.reinstateWorksheet(worksheet_id);
				}
			}

		this.count_analyses = function(remarks) {
			analyses = JSON.parse(remarks);
			return analyses.length;
		}



});

worksheets_module.controller('WorksheetDetailsCtrl',
	function(BikaService, Utility, DashboardService, ngCart, $stateParams, config, $scope, $rootScope) {

		$scope.worksheet = [];
		$scope.worksheet_details = [];
		$scope.checked_list = [];
		$scope.state = {worksheet_id: $stateParams.worksheet_id};

		$scope.analyses = [];
		$scope.analysis_results = Array();

		$scope.stickers={id:null};
		$scope.worksheets = [];
		$scope.analysts = [];

		$scope.loading_worksheet = Utility.loading({
            busyText: 'Wait while loading worksheet data...',
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

        $scope.getAnalysists =
			function() {
				BikaService.getAnalystUsers().success(function (data, status, header, config){
					$scope.analysts = data.result.objects;
				});
			}

		$scope.getWorksheets =
			function() {
				params = {sort_on: 'id', sort_order: 'descending'}
				BikaService.getWorksheets(params).success(function (data, status, header, config){
					$scope.worksheets = data.result.objects;
				});
			}

		// :: function :: getWorksheet()
        $scope.getWorksheet =
            function(worksheet_id) {
            	$scope.loading_worksheet.show();
                params = {sort_on: 'Date', sort_order: 'descending', id: worksheet_id};
                BikaService.getWorksheets(params).success(function (data, status, header, config){
                    $scope.worksheet = data.result.objects[0];
                    var analyses = JSON.parse($scope.worksheet.remarks);
                    var transitions = Array();
                    var workflow_transitions = Array();
					var _analyses = Array();
					var worksheet_details = Array();
                 	_.each(analyses, function(obj) {
                 		params = {id: obj.request_id};
                 		BikaService.getAnalysisRequests(params).success(function (data, status, header, config){
                 			var ar = data.result.objects[0];
                 			var analysis =  _.findWhere(ar.analyses, {'id': obj.analysis_id});
                 			ar.analyses = analysis;
                 			console.log(ar);
                 			return;
                 			worksheet_details.push(ar);
                 			Utility.merge(_analyses,[ar.analyses],'id');
                 			Utility.merge(transitions,ar.transitions,'id');
                 			Utility.merge(workflow_transitions,ar.analyses.transitions,'id');
                 			$scope.transitions = transitions;
                 			$scope.workflow_transitions = workflow_transitions;
                 			if (worksheet_details.length == analyses.length) {
                 				$scope.analyses = _analyses;
                 				$scope.worksheet_details = worksheet_details;
                 				//console.log($scope.worksheet_details)
                 				$scope.loading_worksheet.hide();
                 			}
                 			//$scope.analysis_results[ar.id][obj.analysis_id] =  (ar.analyses.review_state === 'sample_received')?1:ar.analyses.result;
                 			$scope.analysis_results.push({'request_id': ar.id, 'analysis_id': obj.analysis_id, 'result': (ar.analyses.review_state === 'sample_received')?1:ar.analyses.result})
                 		});
                 	});

                });
            };

        $scope.getWorksheet($scope.state.worksheet_id);
        $scope.getWorksheets();
        $scope.getAnalysists();

		this.format_date =
			function(date) {
				return Utility.format_date(date);
			};

		this.format_review_state =
			function(review_state) {
				return Utility.format_review_state(review_state);
			};

		this.results = config.legend.analysis_result;

		this.format_result =
			function(result) {
				return Utility.format_result(result);
			}

		this.check_transitions =
			function(id_transition, transitions) {
				if (transitions === undefined) {
					var transitions = $scope.transitions;
				}
				return Utility.check_transitions(id_transition, transitions);
		}

		this.toggle =
			function(request_id, analysis_id) {
				var idx = _.indexOf($scope.checked_list, _.findWhere($scope.checked_list,  {'request_id': request_id, 'analysis_id': analysis_id}));
				if (idx > -1) {
					$scope.checked_list.splice(idx, 1);
				}
				else {
					$scope.checked_list.push({'request_id': request_id, 'analysis_id': analysis_id});
				}
			}

		this.toggle_all = function() {
				if ($scope.checked_list.length < $scope.worksheet_details.length) {
					_.each($scope.worksheet_details,function(b) {
						var request_id = b.id;
						var analysis_id = b.analyses.id;
						$scope.checked_list.push({'request_id': request_id, 'analysis_id': analysis_id});
					});
				}
				else {
					$scope.checked_list = [];
				}
		}

		$scope.receiveSample =
			function(id) {
				$scope.loading_change_review_state('receiving samples').show();
				params = {ids: id};
				$scope.stickers.id = id;
				BikaService.receiveSample(params).success(function (data, status, header, config){
					//console.log(data);
					$scope.checked_list = [];
					$scope.loading_change_review_state('receiving samples').hide();
					$scope.getWorksheet($scope.state.worksheet_id);
				});
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
				 		BikaService.submit(params).success(function (data, status, header, config){
				 			result = data.result;
				 			//console.log(result);
				 			$scope.checked_list = [];
				 			$scope.submit_params = {analyses: []};
				 			$scope.loading_change_review_state('submitting').hide();
				 			$scope.getWorksheet($scope.state.worksheet_id);
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
					$scope.getWorksheet($scope.state.worksheet_id);
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
					$scope.getWorksheet($scope.state.worksheet_id);
				 });
			}

		$scope.assign =
			function(request_id, analysis_id) {
				if (Array.isArray(request_id) && request_id.length == 0) {
					Utility.alert({title:'Nothing to assign<br/>', content:'Please select at least a Sample', alertType:'warning'});
					return;
				}
				if (Array.isArray(analysis_id) && analysis_id.length == 0) {
					Utility.alert({title:'Nothing to assign<br/>', content:'Please select at least a Analysis', alertType:'warning'});
					return;
				}
				if ($scope.assign_params.switchWorksheet && $scope.assign_params.worksheet == null ||
				 	!$scope.assign_params.switchWorksheet &&
				 	($scope.assign_params.worksheet_title == null || $scope.assign_params.worksheet_title == '' )) {
				 	Utility.alert({title:'Nothing to assign<br/>', content:'Please select at least a Worksheet', alertType:'warning'});
					return;
				}
				$scope.loading_change_review_state('assigning').show();
				if (!$scope.assign_params.switchWorksheet) {
					params = {
						title: $scope.assign_params.worksheet_title,
						description: $scope.assign_params.worksheet_title,
						Analyst: $scope.assign_params.analyst.userid,
						Remarks: $scope._get_worksheet_analyses(request_id, analysis_id),
					};
					BikaService.createWorksheet(params).success(function (data, status, header, config){
						result = data.result;
						$scope.checked_list = [];
						$scope.assign_params = {
							analyses: [],
							worksheet: null,
							analyst: null,
							worksheet_title: null,
							worksheet_description: null,
							switchWorksheet: false,
						};
						$scope.loading_change_review_state('assigning').hide();
						$scope.getWorksheet($scope.state.worksheet_id);
						$scope.getWorksheets();
					});

				}
				else {
					//console.log($scope.assign_params.worksheet);

					params = {
						obj_path: $scope.assign_params.worksheet.path,
						Remarks: $scope._get_worksheet_analyses(request_id, analysis_id, JSON.parse($scope.assign_params.worksheet.remarks)),
					}
					BikaService.updateWorksheet(params).success(function (data, status, header, config){
						result = data.result;
						$scope.checked_list = [];
						$scope.assign_params = {
							analyses: [],
							worksheet: null,
							analyst: null,
							worksheet_title: null,
							worksheet_description: null,
							switchWorksheet: false,
						};
						$scope.loading_change_review_state('assigning').hide();
						$scope.getWorksheet($scope.state.worksheet_id);
						$scope.getWorksheets();
					});

				}
				//$scope.loading_change_review_state('assigning').show();
		}

		$scope._get_worksheet_analyses =
			function(request_id, analysis_id, analysis_list) {
				if (!Array.isArray(request_id) && !Array.isArray(analysis_id)) {
					var worksheet_analyses = [];
					var item = {
						request_id: request_id,
						analysis_id: analysis_id,
						obj_path: $scope._get_analysis_path(request_id, analysis_id),
					};
					worksheet_analyses.push(item);
					if (analysis_list !== undefined) {
						Utility.merge(worksheet_analyses,analysis_list,'request_id');
					}

					return JSON.stringify(worksheet_analyses);

				}
				else if (Array.isArray(request_id)) {
					var worksheet_analyses = [];
					_.each(request_id,function(request_obj) {

						var item = {
								request_id: request_obj.request_id,
								analysis_id: request_obj.analysis_id,
								obj_path: $scope._get_analysis_path(request_obj.request_id, request_obj.analysis_id),
								analyst: $scope.assign_params.analyst.userid,
						};
						worksheet_analyses.push(item);

					});
					if (analysis_list !== undefined) {
						Utility.merge(worksheet_analyses,analysis_list,'request_id');
					}
					return JSON.stringify(worksheet_analyses);
				}

			}

		$scope._get_action_params =
			function(request_id, analysis_id, action) {
				if (!Array.isArray(request_id) && !Array.isArray(analysis_id)) {
					var f = []
					f.push($scope._get_analysis_path(request_id, analysis_id));
					return JSON.stringify(f);
				}
				else if (Array.isArray(request_id)) {
					var f = []
					_.each(request_id,function(request_obj) {
						if (action !== undefined && action=='publish') {
							f.push($scope._get_analysis_path(request_obj.request_id));
						}

						f.push($scope._get_analysis_path(request_obj.request_id,request_obj.analysis_id));

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
				else if (Array.isArray(request_id)) {
					var input_values = {};
					_.each(request_id,function(request_obj) {
						input_values[$scope._get_analysis_path(request_obj.request_id,request_obj.analysis_id)] = {Result: $scope._get_analysis_result(request_obj.request_id,request_obj.analysis_id)}
					});
					return JSON.stringify(input_values);
				}
			}

		$scope._get_analysis_path =
			function(request_id, analysis_id) {
				request = _.findWhere($scope.worksheet_details, {'id': request_id});
				if (analysis_id === undefined) {
					return request.path;
				}
				else {return request.path + "/" + analysis_id;}
			}

		$scope._get_analysis_result =
			function(request_id, analysis_id) {
				analysis_results = _.findWhere($scope.analysis_results, {'request_id': request_id, 'analysis_id': analysis_id});
				return analysis_results.result.toString();
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



});