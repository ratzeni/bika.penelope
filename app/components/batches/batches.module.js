var batches_module = angular.module('BatchesModule',[]);

batches_module.run(function($rootScope){
  $rootScope._ = _;
});

batches_module.controller('BatchesCtrl',
	function(BikaService, Utility, DashboardService, config, ngCart, $scope, $rootScope) {

		$scope.loading_search = Utility.loading({
            busyText: 'Wait while searching batches...',
            delayHide: 500,
        });

        $scope.loading_blackboard = Utility.loading({
            busyText: 'Wait while updating board...',
            delayHide: 100000,
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

		$scope.samples = {};

		this.changePage = function(newPageNumber, oldPageNumber) {
			if (newPageNumber !== undefined) {
				$scope.pagination.page_nr = newPageNumber-1;
				$scope.pagination.current = newPageNumber;
			}
			$scope.getBatches($scope.review_state);
		}

		// :: function :: getBatches()
        $scope.getBatches =
            function(review_state) {
            	$scope.loading_search.show();
            	$scope.review_state = review_state;
                $scope.batches = [];
                params = {sort_on: 'Date', sort_order: 'descending', review_state: review_state,
                	page_nr: $scope.pagination.page_nr, page_size: $scope.pagination.page_size};

                BikaService.getBatches(params).success(function (data, status, header, config){
                    $scope.batches = data.result.objects;
                    $scope.pagination.total = data.result.total;
                    $scope.pagination.last = data.result.last;
					transitions = Array();
					_.each($scope.batches,function(obj) {
						Utility.merge(transitions,obj.transitions,'id');
					});
                    $scope.transitions = transitions;
					$scope.loading_search.hide();
					$rootScope.counter = DashboardService.update_dashboard();
					$scope.count_samples();
                });
            };

		$scope.count_samples = function() {
			_.each($scope.batches,function(batch) {
					params = {title: batch.id, include_fields: 'path'};
					BikaService.countAnalysisRequests(params).success(function (data, status, header, config){
						$scope.samples[batch.id] = data.result;
                	});
			});
		}

        $scope.closeBatch =
			function(batch_id) {
				$scope.loading_change_review_state('closing batches').show();
				params = {ids: batch_id};
				BikaService.closeBatch(params).success(function (data, status, header, config){
					$scope.loading_change_review_state('closing batches').hide();
					$scope.checked_list = [];
				 	$scope.getBatches($scope.review_state);
				});

			}

		$scope.openBatch =
			function(batch_id) {
				$scope.loading_change_review_state('opening batches').show();
				params = {ids: batch_id};
				BikaService.openBatch(params).success(function (data, status, header, config){
					$scope.loading_change_review_state('opening batches').hide();
					$scope.checked_list = [];
				 	$scope.getBatches($scope.review_state);
				});


			}

		$scope.cancelBatch =
			function(batch_id) {
				$scope.loading_change_review_state('deleting batches').show();
				params = {id: batch_id};
				BikaService.cancelBatch(params).success(function (data, status, header, config){
					$scope.loading_change_review_state('deleting batches').hide();
					$scope.checked_list = [];
				 	$scope.getBatches($scope.review_state);
				});

			}

		$scope.reinstateBatch =
			function(batch_id) {
				$scope.loading_change_review_state('reinstating batches').show();
				params = {ids: batch_id};
				BikaService.reinstateBatch(params).success(function (data, status, header, config){
					$scope.loading_change_review_state('reinstating batches').hide();
					$scope.checked_list = [];
				 	$scope.getBatches($scope.review_state);
				});

			}


        $scope.sort = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}

		$scope.getBatches($scope.review_state);

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
				if ($scope.checked_list.length < $scope.batches.length) {
					_.each($scope.batches,function(b) {
						$scope.checked_list.push(b.id);
					})
				}
				else {
					$scope.checked_list = [];
				}
		}



		this.change_review_state =
			function (action, batch_id) {
				if (batch_id === undefined) {
					var batch_id = $scope.checked_list.join('|');
				}

				if (action === 'close') {
					 $scope.closeBatch(batch_id);
				}
				else if (action === 'open') {
					 $scope.openBatch(batch_id);
				}
				else if (action === 'cancel') {
					 $scope.cancelBatch(batch_id);
				}
				else if (action === 'reinstate') {
					 $scope.reinstateBatch(batch_id);
				}
			}

		this.add_to_blackboard =
			function(batch_ids) {

				_.each(batch_ids,function(batch_id) {
					$scope.loading_blackboard.show();
					params = {title: batch_id};
					BikaService.getAnalysisRequests(params).success(function (data, status, header, config){
						var analysis_requests = data.result;
						_.each(analysis_requests, function(ar) {
							if (ngCart.getItemById(ar.id) === false ) {
								ngCart.addItem(ar.id,ar.id,1,1,ar);
							}
						});
						$scope.loading_blackboard.hide();
					})
				});
				$scope.checked_list = [];
			}

		this.remove_from_blackboard =
			function(batch_ids) {
				_.each(batch_ids,function(batch_id) {
					params = {title: batch_id};
					BikaService.getAnalysisRequests(params).success(function (data, status, header, config){
						var analysis_requests = data.result;
						_.each(analysis_requests, function(ar) {
							if (ngCart.getItemById(ar.id) !== false ) {
								ngCart.removeItemById(ar.id);
							}
						});
					})
				});
				$scope.checked_list = [];
			}

});


batches_module.controller('BatchDetailsCtrl',
	function(BikaService, Utility, DashboardService, ngCart, $stateParams, config, $scope, $rootScope) {

		$scope.batch = [];
		$scope.analyses = []
		$scope.analysis_requests = [];
		$scope.checked_list = [];
		$scope.review_state = 'active';
		$scope.stickers={id:null};
		$scope.state = {batch_id: $stateParams.batch_id};
		$scope.attachment = {content: [], sample_list:[]};

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
			//$scope.getAnalysisRequests($stateParams.batch_id, $stateParams.review_state);
			$scope.getBatch($stateParams.batch_id);
		}

		$scope.loading_batch = Utility.loading({
            busyText: 'Wait while loading batch data...',
            delayHide: 500,
        });

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

		$scope.get_sample_list =
			function(batch_id) {
				params = {sort_on: 'getId', sort_order: 'ascending', title: batch_id};
				BikaService.getAnalysisRequests(params).success(function (data, status, header, config){
					var analysis_requests = data.result.objects;
					_.each(analysis_requests,function(ar) {
						if (ar.sample_type.match('IN-')) {
							$scope.attachment.sample_list.push({sample: ar.sample_id+'|'+ar.client_sample_id});
						}
					});
				});
			}

		$scope.getAnalysisRequests =
            function(batch_id, review_state, print_stickers) {
            	$scope.loading_ars.show();
            	$scope.review_state = review_state;
                $scope.analysis_requests = [];
                params = {sort_on: 'getId', sort_order: 'ascending', title: batch_id, review_state: review_state,
                	page_nr: $scope.pagination.page_nr, page_size: $scope.pagination.page_size};

                BikaService.getAnalysisRequests(params).success(function (data, status, header, config){
                    $scope.analysis_requests = data.result.objects;
                    $scope.pagination.total = data.result.total;
                    $scope.pagination.last = data.result.last;
                    transitions = Array();
					_.each($scope.analysis_requests,function(obj) {
						if ($scope.attachment.content.length === 0 && obj.remarks != '') {
							_.each(JSON.parse(obj.remarks), function(obj) {
								$scope.attachment.content.push(obj.split(','));
							});
							$scope.get_sample_list($stateParams.batch_id);
						}

						Utility.merge(transitions,obj.transitions,'id');
						if (obj.analyses.length > 0 && $scope.analyses.length == 0 && $scope.review_state == 'active' ) {
							$scope.analyses = obj.analyses;
						}
					});

                    $scope.transitions = transitions;
                    $scope.loading_ars.hide();
                    if (print_stickers !==undefined && print_stickers === true) {
                    	Utility.print_stickers($scope.stickers.id, $scope.batch.path);
                    }
                    $rootScope.counter = DashboardService.update_dashboard();
                });
            };

		// :: function :: getBatch()
        $scope.getBatch =
            function(batch_id) {
            	$scope.loading_batch.show();
                params = {sort_on: 'Date', sort_order: 'descending', id: batch_id};
                BikaService.getBatches(params).success(function (data, status, header, config){
                    $scope.batch = data.result.objects[0];
                    $scope.loading_batch.hide();
                    $scope.getAnalysisRequests($scope.batch.id, $scope.review_state);
                });
            };

        $scope.sort = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}

		$scope.getBatch($stateParams.batch_id);

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

		this.toggle_all = function() {
				if ($scope.checked_list.length < $scope.analysis_requests.length) {
					_.each($scope.analysis_requests,function(ar) {
						$scope.checked_list.push(ar.id);
					})
				}
				else {
					$scope.checked_list = [];
				}
		}

		$scope.cancelAnalysisRequest =
			function(id) {
				$scope.loading_change_review_state('deleting analysis requests').show();
				params = {ids: id};
				BikaService.cancelAnalysisRequest(params).success(function (data, status, header, config){
					$scope.checked_list = [];
					$scope.loading_change_review_state('deleting analysis requests').hide();
					$scope.getBatch($stateParams.batch_id);
				});

			}

		$scope.reinstateAnalysisRequest =
			function(id) {
				$scope.loading_change_review_state('reinstating analysis requests').show();
				params = {ids: id};
				BikaService.reinstateAnalysisRequest(params).success(function (data, status, header, config){
				 	$scope.checked_list = [];
				 	$scope.loading_change_review_state('reinstating analysis requests').hide();
				 	$scope.getBatch($stateParams.batch_id);
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
					$scope.getAnalysisRequests($scope.batch.id, $scope.review_state, true);

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

		this.get_filename =
			function () {
				if ($scope.analysis_requests === undefined || $scope.analysis_requests.length===0) {return 'download.csv';}
				if ($scope.analysis_requests[0].sample_type === 'FLOWCELL') {
					return 'samplesheet_' + $scope.analysis_requests[0].sample_id + '_' + $scope.analysis_requests[0].client_sample_id + '.cvs';
				}
				else if ($scope.analysis_requests[0].sample_type === 'POOL') {
					return 'samplelist_' + $scope.analysis_requests[0].sample_id + '_' + $scope.analysis_requests[0].client_sample_id + '.cvs';
				}

				return 'filename.csv'
			}

		this.check_attachment_type =
			function (attachment_type) {
				return false;
//				if (attachment_type === 'samplesheet') {
//					return $scope.analysis_requests[0].sample_type === 'FLOWCELL';
//				}
			}

		this.add_to_blackboard =
			function(ids) {
				_.each(ids,function(id) {
					if (ngCart.getItemById(id) === false ) {
						var ar = _.findWhere($scope.analysis_requests, {'id': id});
						if (ar !== undefined) {ngCart.addItem(id,id,1,1,ar);}
					}
				});
				$scope.checked_list = [];
			}

		this.remove_from_blackboard =
			function(ids) {
				_.each(ids,function(id) {
					if (ngCart.getItemById(id) !== false ) {
						//var ar = _.findWhere($scope.analysis_requests, {'id': id});
						ngCart.removeItemById(id);
					}
				});
				$scope.checked_list = [];
		}
});

batches_module.controller('BatchBookCtrl',
	function(BikaService, Utility, DashboardService, ngCart, $stateParams, config, $scope, $modal, $rootScope) {

		//$scope.batch = [];
		$scope.analyses = []
		$scope.analysis_requests = [];
		$scope.analysis_results = [];
		$scope.checked_list = [];
		$scope.batch_id = $stateParams.batch_id;
		$scope.submit_params = {analyses: []};
		$scope.verify_params = {analyses: []};
		$scope.publish_params = {analyses: []};
		$scope.assign_params = {
			analyses: [],
			worksheet: null,
			analyst: null,
			worksheet_title: null,
			worksheet_description: null,
			switchWorksheet: false,

		};
		$scope.stickers={id:null};
		$scope.worksheets = [];
		$scope.analysts = [];


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
			$scope.getAnalysisRequests($stateParams.batch_id);
		}


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
            function(batch_id, print_stickers) {
                $scope.analysis_requests = [];
                params = {sort_on: 'id', sort_order: 'ascending', title: batch_id, cancelled_state: 'active',
                	page_nr: $scope.pagination.page_nr, page_size: $scope.pagination.page_size};

                BikaService.getAnalysisRequests(params).success(function (data, status, header, config){
                    $scope.analysis_requests = data.result.objects;
                    $scope.pagination.total = data.result.total;
                    $scope.pagination.last = data.result.last;

                    transitions = Array();
                    workflow_transitions = Array()
					_.each($scope.analysis_requests,function(obj) {
						Utility.merge(transitions,obj.transitions,'id');
						if (obj.analyses.length > 0 && $scope.analyses.length == 0 && $scope.review_state == 'active' ) {
							$scope.analyses = obj.analyses;
						}
						$scope.obj_id = obj.id;
						$scope.analysis_results[$scope.obj_id] = [];
						$scope.analysis_worksheets[$scope.obj_id] = [];
						$scope.analysis_analysts[$scope.obj_id] = [];
						_.each(obj.analyses, function(o) {
							Utility.merge(workflow_transitions, o.transitions, 'id');
							$scope.analysis_results[$scope.obj_id][o.id] = (o.review_state === 'sample_received')?1:o.result;
						});

					});
                    $scope.transitions = transitions;
                    $scope.workflow_transitions = workflow_transitions;
                    //console.log($scope.transitions);
                    //console.log($scope.workflow_transitions);
                    if (print_stickers !==undefined && print_stickers === true) {
                    	Utility.print_stickers($scope.stickers.id, $scope.batch.path);
                    }
                    $rootScope.counter = DashboardService.update_dashboard();
                });
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

        $scope.getAnalysisRequests($stateParams.batch_id);
        $scope.getWorksheets();
        $scope.getAnalysists();

        $scope.cancelAnalysisRequest =
			function(id) {
				$scope.loading_change_review_state('deleting analysis requests').show();
				params = {ids: id};
				BikaService.cancelAnalysisRequest(params).success(function (data, status, header, config){
				 	$scope.checked_list = [];
				 	$scope.loading_change_review_state('deleting analysis requests').hide();
				 	$scope.getAnalysisRequests($stateParams.batch_id);
				});

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
					$scope.getAnalysisRequests($stateParams.batch_id, true);

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
				 		//console.log(params);

				 		BikaService.submit(params).success(function (data, status, header, config){
				 			result = data.result;
				 			//console.log(result);
				 			$scope.checked_list = [];
				 			$scope.submit_params = {analyses: []};
				 			$scope.loading_change_review_state('submitting').hide();
				 			$scope.getAnalysisRequests($stateParams.batch_id);
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
					$scope.getAnalysisRequests($stateParams.batch_id);
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
					$scope.getAnalysisRequests($stateParams.batch_id);
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
						$scope.getAnalysisRequests($stateParams.batch_id);
						$scope.getWorksheets();
					});

				}
				else {
					console.log($scope.assign_params.worksheet);

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
						$scope.getAnalysisRequests($stateParams.batch_id);
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
				else if (Array.isArray(request_id) && Array.isArray(analysis_id)) {
					var worksheet_analyses = [];
					_.each(request_id,function(request_obj) {
						_.each(analysis_id,function(analysis_obj) {
							var item = {
								request_id: request_obj,
								analysis_id: analysis_obj.id,
								obj_path: $scope._get_analysis_path(request_obj, analysis_obj.id),
								analyst: $scope.assign_params.analyst.userid,
							};
							worksheet_analyses.push(item);
						});
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
				request = _.findWhere($scope.analysis_requests, {'id': request_id});
				if (analysis_id === undefined) {
					return request.path;
				}
				else {return request.path + "/" + analysis_id;}

			}

		$scope._get_analysis_result =
			function(request_id, analysis_id) {
				return $scope.analysis_results[request_id][analysis_id].toString();
			}

        this.check_transitions = function(id_transition, transitions) {
			if (transitions === undefined) {
				var transitions = $scope.transitions;
			}
			return Utility.check_transitions(id_transition, transitions);
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
		this.results = config.legend.analysis_result;

		this.format_review_state =
			function(review_state) {
				return Utility.format_review_state(review_state);
			}

		this.format_result =
			function(result) {
				return Utility.format_result(result);
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

		this.toggle_all = function() {
				if ($scope.checked_list.length < $scope.analysis_requests.length) {
					_.each($scope.analysis_requests,function(ar) {
						$scope.checked_list.push(ar.id);
					})
				}
				else {
					$scope.checked_list = [];
				}
		}

		this.add_to_blackboard =
			function(ids) {
				_.each(ids,function(id) {
					if (ngCart.getItemById(id) === false ) {
						var ar = _.findWhere($scope.analysis_requests, {'id': id});
						if (ar !== undefined) {ngCart.addItem(id,id,1,1,ar);}
					}
				});
				$scope.checked_list = [];
			}

		this.remove_from_blackboard =
			function(ids) {
				_.each(ids,function(id) {
					if (ngCart.getItemById(id) !== false ) {
						//var ar = _.findWhere($scope.analysis_requests, {'id': id});
						ngCart.removeItemById(id);
					}
				});
				$scope.checked_list = [];
		}

		 $scope.$watch('assign_params.worksheet',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null ) { return; }
                $scope.assign_params.analyst = _.findWhere($scope.analysts, {'userid': $scope.assign_params.worksheet.analyst});
         });

	});