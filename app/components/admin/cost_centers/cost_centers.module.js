var cost_centers_module = angular.module('CostCentersModule', []);

cost_centers_module.run(function($rootScope){
  $rootScope._ = _;
});

cost_centers_module.controller('CostCentersCtrl',
	function(BikaService, Utility, $state, $scope, $rootScope) {

		$scope.loading_search = Utility.loading({
            busyText: 'Wait while loading...',
            delayHide: 700,
        });

        $scope.loading_change_review_state =
        	function(text) {
        		this.params = {
	        		busyText: text===undefined?'Wait...':'Wait while ' + text + '...',
            		delayHide: 700,
            		theme: 'warning',
        		}
        		return Utility.loading(this.params);
        	};


		$scope.checked_list = [];
		$scope.review_state = 'pending';

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
			$scope.getSupplyOrders($scope.review_state);
		}

		$scope.sort = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}

		$scope.init =
			function(review_state) {
			this.params = {};
			$scope.clients = [];
			$scope.loading_search.show();
            BikaService.getClients(this.params).success(function (data, status, header, config){
            	$scope.clients = data.result.objects;
            	$scope.getSupplyOrders(review_state);
            });

		}

		$scope.getSupplyOrders =
            function(review_state) {

            	$scope.review_state = review_state;
                $scope.supply_orders = [];
                this.params = {	sort_on: 'Date', sort_order: 'descending',
                			page_nr: $scope.pagination.page_nr, page_size: $scope.pagination.page_size};

                if (review_state === 'all') {
					this.params['Subjects'] = 'pending|dispatch';
				}
				else {
					this.params['Subject'] = review_state;
				}

                BikaService.getSupplyOrders(this.params).success(function (data, status, header, config){

                	$scope.supply_orders = data.result.objects;
                    $scope.pagination.total = data.result.total;
                    $scope.pagination.last = data.result.last;

                	transitions = Array();
					_.each($scope.supply_orders,function(obj) {
						Utility.merge(transitions,obj.transitions,'id');
					});
                    $scope.transitions = transitions;
					$scope.loading_search.hide();
                });
		}


		$scope.init($scope.review_state);

		this.get_client =
			function(client_id) {
				this.client = _.findWhere($scope.clients, {id: client_id});

				return this.client.title;
			}

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
				if ($scope.checked_list.length < $scope.supply_orders.length) {
					_.each($scope.supply_orders,function(b) {
						$scope.checked_list.push(b.id);
					})
				}
				else {
					$scope.checked_list = [];
				}
		}

		this.change_review_state =
			function (action, supply_order_id) {
				if (supply_order_id === undefined) {
					var supply_order_id = $scope.checked_list.join('|');
				}

				if (action === 'activate') {
					 $scope.activateSupplyOrder(supply_order_id);
				}
				else if (action === 'deactivate') {
					 $scope.deactivateSupplyOrder(supply_order_id);
				}
				else if (action === 'dispatch') {
					 $scope.dispatchSupplyOrder(supply_order_id);
				}
			}

		$scope.activateSupplyOrder =
			function(supply_order_id) {
				$scope.loading_change_review_state('activating').show();
				this.params = {ids: supply_order_id};
				BikaService.activateSupplyOrder(this.params).success(function (data, status, header, config){
					$scope.checked_list = [];
			 		$scope.getSupplyOrders($scope.review_state);
				});
			}

		$scope.deactivateSupplyOrder =
			function(supply_order_id) {
				$scope.loading_change_review_state('deactivating').show();
				this.params = {ids: supply_order_id};
				BikaService.deactivateSupplyOrder(this.params).success(function (data, status, header, config){
					$scope.loading_change_review_state('deactivating').hide();
					$scope.checked_list = [];
			 		$scope.getSupplyOrders($scope.review_state);
				});
			}

		$scope.dispatchSupplyOrder =
			function(supply_order_id) {
				$scope.loading_change_review_state('dispatching').show();
				this.params = {ids: supply_order_id};
				BikaService.dispatchSupplyOrder(this.params).success(function (data, status, header, config){
					this.params = {input_values: $scope._get_input_values_review_state(supply_order_id,'dispatched')};
					BikaService.updateSupplyOrders(params).success(function (data, status, header, config){
						$scope.loading_change_review_state('dispatching').hide();
						$scope.checked_list = [];
				 		$scope.getSupplyOrders($scope.review_state);
					});
				});
			}

		$scope._get_input_values_review_state =
			function (supply_order_id, review_state) {
				supply_order_id = supply_order_id.split('|');
				var input_values = {};
				_.each(supply_order_id,function(id) {
					supply_order = _.findWhere($scope.supply_orders, {'id': id});
					input_values[supply_order.path] = {subject: review_state!==undefined?review_state:supply_order.review_state};
				});
				return JSON.stringify(input_values);
			}
});

cost_centers_module.controller('AddCostCenterCtrl',
	function(BikaService, Utility, $state, $scope, $rootScope) {

		$scope.clients = [];
		$scope.contacts= [];
		$scope.batches = [];

		$scope.loading_create = Utility.loading({
            busyText: 'Wait while creating...',
            delayHide: 500,
        });

		// :: function :: getClients()
        $scope.getClients =
            function(costcenter_params) {
                $scope.clients = [];
                this.params = {};
                BikaService.getClients(this.params).success(function (data, status, header, config){
                    $scope.clients = data.result.objects;
                });
            };

		// :: function :: getContacts()
        $scope.getContacts =
            function(costcenter_params) {
                $scope.contacts = [];
                this.params = costcenter_params.selectedClient != null ? {client_id: costcenter_params.selectedClient.id} : {}
                BikaService.getContacts(this.params).success(function (data, status, header, config){
                    $scope.contacts = data.result.objects;
                });
            };

		// :: function :: getBatches()
        $scope.getBatches =
            function(costcenter_params) {
                $scope.batches = [];
                this.params = {'Subject': 'open'}
                BikaService.getBatches(this.params).success(function (data, status, header, config){
                    _.each(data.result.objects, function(batch) {
                    	if (batch.client ===  $scope.costcenter_params.selectedClient.title && batch.cost_center == '') {
                    		$scope.batches.push(batch);
                    	}
                    });

                });
            };

		// :: function :: update()
        $scope.update =
            function(costcenter_params) {
                if (_.size(costcenter_params) === 0) {
                    $scope.getClients();
                }
            };

        $scope.update([]);

		$scope.costcenter_params = {
            selectedClient: null,
            selectedContact: null,
        	selectedOrderDate: Utility.format_date(),
        	selectedExpirationDate: Utility.format_date(),
        	selectedTitle: null,
        	selectedDescription: null,
        	selectedAmount: null,
        	selectedBatches: null,

        };

        $scope.$watch('costcenter_params.selectedClient',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null || newValue === undefined ) {
                	$scope.contacts = [];
                	$scope.batches = [];
                	return; }

                $scope.getContacts($scope.costcenter_params);
                $scope.getBatches($scope.costcenter_params);


            }
        );

        this.submit =
        	function(costcenter_params) {
        		this.cc_params = {
        			'ClientID': costcenter_params.selectedClient.id,
					'Contact': costcenter_params.selectedContact.id,
					'OrderDate': Utility.format_date(costcenter_params.selectedOrderDate),
					'OrderNumber': costcenter_params.selectedOrderNumber != undefined?costcenter_params.selectedOrderNumber:'',
					'title': costcenter_params.selectedTitle != undefined?costcenter_params.selectedTitle:'',
					'description': costcenter_params.selectedDescription,
					'expirationDate': Utility.format_date(costcenter_params.selectedExpirationDate),
					'subject': 'pending',
					'rights': costcenter_params.selectedAmount != undefined?costcenter_params.selectedAmount:'',
        		}
				$scope.loading_create.show();
        		BikaService.createSupplyOrder(this.cc_params).success(function (data, status, header, config){
					result = data.result;

                    if (result['success'] === 'True') {
                    	obj_id = result['obj_id'];
                    	Utility.alert({title:'Success', content: 'Your Cost Center has been successfully created with ID: '+obj_id, alertType:'success'});
                    	if (Array.isArray($scope.costcenter_params.selectedBatches) &&  $scope.costcenter_params.selectedBatches.length > 0) {
                    		_.each($scope.costcenter_params.selectedBatches, function(batch){
								this.batch_params = {'obj_path': batch.path, 'rights': obj_id}
								BikaService.updateBatch(this.batch_params).success(function (data, status, header, config){
									this.result = data.result;
									if (this.result['success'] === 'True') {
										Utility.alert({title:'Success', content: 'Batch '+batch.title+' has been added to '+obj_id, alertType:'success'});
									}
									else {
										Utility.alert({title:'Error while creating...', content: result['message'], alertType:'danger'});
										return;
									}
								});

                    		});

							$state.go('cost_centers',{},{reload: true});
                    	}
                    	else {
							$scope.loading_create.hide();
							Utility.alert({title:'Success', content: 'Your Cost Center has been successfully created with ID: '+obj_id, alertType:'success'});

                    	}

        			}
        			else {
        				console.log(result['message']);
						$scope.loading_create.hide();
						Utility.alert({title:'Error while creating...', content: result['message'], alertType:'danger'});
						return;
        			}
        		});

        	}
});

cost_centers_module.controller('CostCenterDetailsCtrl',
	function(BikaService, Utility, $state, $stateParams, $scope, $rootScope) {

		$scope.state = {costcenter_id: $stateParams.costcenter_id};
		$scope.cost_center = null;
		$scope.batches = [];
		$scope.samples = {};

		$scope.loading_search = Utility.loading({
            busyText: 'Wait while loading...',
            delayHide: 1000,
        });

        $scope.loading_change_review_state =
        	function(text) {
        		this.params = {
	        		busyText: text===undefined?'Wait...':'Wait while ' + text + '...',
            		delayHide: 700,
            		theme: 'warning',
        		}
        		return Utility.loading(this.params);
        	};

        $scope.getCostCenter =
        	function(costcenter_id) {

                this.params = {sort_on: 'Date', sort_order: 'descending', id: costcenter_id};
                BikaService.getSupplyOrders(this.params).success(function (data, status, header, config){
                    $scope.cost_center = data.result.objects[0];
                    $scope.costcenter_params = {
						selectedOrderDate: Utility.format_date($scope.cost_center.order_date),
						selectedExpirationDate:Utility.format_date($scope.cost_center.expiration_date),
						selectedTitle: $scope.cost_center.title,
						selectedDescription: $scope.cost_center.description,
						selectedAmount: $scope.cost_center.rights,
						selectedOrderNumber: $scope.cost_center.order_number,
					};
        		});
        	}

		$scope.init =
			function(costcenter_id) {
			this.params = {};
			$scope.clients = [];
			$scope.loading_search.show();
            BikaService.getClients(this.params).success(function (data, status, header, config){
            	$scope.clients = data.result.objects;
            	$scope.getCostCenter($scope.state.costcenter_id);
            	this.params = {};
            	BikaService.getBatches(this.params).success(function (data, status, header, config){

            		_.each(data.result.objects, function(batch) {

                    	if (batch.cost_center == $scope.state.costcenter_id) {
                    		$scope.batches.push(batch);
                    	}
                    });
                    $scope.loading_search.hide();
                    $scope.count_samples();
            	});

            });
		}

		$scope.init($scope.state.costcenter_id);

		this.get_client =
			function(client_id) {
				this.client = _.findWhere($scope.clients, {id: client_id});

				return this.client.title;
			}

		this.format_date =
			function(date) {
				return Utility.format_date(date);
			};

		this.format_review_state =
			function(review_state) {
				return Utility.format_review_state(review_state);
			};

		$scope.count_samples = function() {
			_.each($scope.batches,function(batch) {
					this.params = {title: batch.id, include_fields: 'path'};
					BikaService.countAnalysisRequests(this.params).success(function (data, status, header, config){
						$scope.samples[batch.id] = data.result;
                	});
			});
		}

		this.edit =
			function(costcenter_params) {
				this.params = {
					'obj_path': $scope.cost_center.path,
					'OrderDate': Utility.format_date(costcenter_params.selectedOrderDate),
					'OrderNumber': costcenter_params.selectedOrderNumber,
					'title': costcenter_params.selectedTitle,
					'description': costcenter_params.selectedDescription,
					'expirationDate': Utility.format_date(costcenter_params.selectedExpirationDate),
				}
				BikaService.updateSupplyOrder(this.params).success(function (data, status, header, config){
					this.result = data.result;
					if (this.result['success'] === 'True') {
						Utility.alert({title:'Success', content: 'Center Cost '+$scope.cost_center.title+' has been edited', alertType:'success'});
						$state.go('cost_center',{'costcenter_id': $scope.cost_center.id},{reload: true});
					}
					else {
						Utility.alert({title:'Error while editing...', content: result['message'], alertType:'danger'});
						return;
					}
				});

			}

});