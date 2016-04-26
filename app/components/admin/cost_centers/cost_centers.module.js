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
		$scope.checked_list = [];
		$scope.lab_products = [];

		$scope.loading_create = Utility.loading({
            busyText: 'Wait while creating...',
            delayHide: 500,
        });

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
			$scope.getLabProducts();
		}

		$scope.sort = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}


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

        // :: function :: getLabProducts)=
        $scope.getLabProducts =
			function() {
				this.params = {'Subject': 'active', page_nr: $scope.pagination.page_nr, page_size: $scope.pagination.page_size};
				BikaService.getLabProducts(this.params).success(function (data, status, header, config){
					$scope.lab_products = data.result.objects;
				});
			}


		// :: function :: update()
        $scope.update =
            function(costcenter_params) {
                if (_.size(costcenter_params) === 0) {
                    $scope.getClients();
                }
            };

        $scope.update([]);
        $scope.getLabProducts();

		$scope.costcenter_params = {
            selectedClient: null,
            selectedContact: null,
        	selectedOrderDate: Utility.format_date(),
        	selectedExpirationDate: Utility.format_date(),
        	selectedTitle: null,
        	selectedDescription: null,
        	selectedAmount: null,
        	selectedBatches: null,
			selectedLabProducts: {},
			selectedEstimatedCost: null,
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
					'location': costcenter_params.selectedEstimatedCost != undefined?costcenter_params.selectedEstimatedCost:'',
					'rights': costcenter_params.selectedAmount != undefined?costcenter_params.selectedAmount:'',
					'Remarks': JSON.stringify(costcenter_params.selectedLabProducts),
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
							//Utility.alert({title:'Success', content: 'Your Cost Center has been successfully created with ID: '+obj_id, alertType:'success'});
							$state.go('cost_centers',{},{reload: true});
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

        this.format_date =
			function(date) {
				if (date == null) {return "";}
				return Utility.format_date(date);
			};

		this.format_review_state =
			function(review_state) {
				return Utility.format_review_state(review_state);
		};

		this.toggle =
			function(id) {
				var idx = $scope.checked_list.indexOf(id);
				if (idx > -1) {
					$scope.checked_list.splice(idx, 1);
					delete $scope.costcenter_params.selectedLabProducts[id];
				}
				else {
					$scope.checked_list.push(id);
				}
			}

		this.toggle_all = function() {
				if ($scope.checked_list.length < $scope.lab_products.length) {
					_.each($scope.lab_products,function(b) {
						$scope.checked_list.push(b.id);
					})
				}
				else {
					$scope.checked_list = [];
					$scope.costcenter_params.selectedLabProducts = {};
				}
		}
});

cost_centers_module.controller('CostCenterDetailsCtrl',
	function(BikaService, Utility, $state, $stateParams, $scope, $rootScope) {

		$scope.state = {costcenter_id: $stateParams.costcenter_id};
		$scope.cost_center = null;
		$scope.lab_products = [];
		$scope._lab_products = [];
		$scope.batches = [];

		$scope.samples = {};
		$scope.checked_list = [];

		$scope.stats = {amount: -1, start: false};

		$scope.loading_search = Utility.loading({
            busyText: 'Wait while loading...',
            delayHide: 1000,
        });

        $scope.loading_update = Utility.loading({
            busyText: 'Wait while updating...',
            delayHide: 500,
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

        $scope.sort = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}

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
						selectedBatches: null,
						selectedEstimatedCost: $scope.cost_center.location,
						selectedLabProducts: JSON.parse($scope.cost_center.remarks),
					};
					var counter = 0;
					_.each(_.keys(JSON.parse($scope.cost_center.remarks)), function(id) {
						this.params = {'id': id};
						$scope.checked_list.push(id);
						BikaService.getLabProducts(this.params).success(function (data, status, header, config){
							$scope.lab_products.push(data.result.objects[0]);
							counter++;
							if (counter === _.size(JSON.parse($scope.cost_center.remarks))) {
								this.params = {'sort_on': 'title', Subject: 'active'};
								BikaService.getLabProducts(this.params).success(function (data, status, header, config){
									this.result = data.result.objects;
									_.each(this.result, function (obj){
										if (_.findWhere($scope.lab_products, {'id': obj['id']}) === undefined ){
											 $scope._lab_products.push(obj);
										}
									});
								});

							}

						});
					});

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
					all_batches = [];
            		_.each(data.result.objects, function(batch) {
                    	if (batch.cost_center == $scope.state.costcenter_id) {
                    		$scope.batches.push(batch);
                    	}
                    	else if (batch.cost_center != $scope.state.costcenter_id
                    	 		&& batch.cost_center == ''
                    			&& batch.client == $scope.get_client($scope.cost_center.client_id)) {
                    		all_batches.push(batch);
                    	}

                    });
                    $scope.data= {all_batches: all_batches};
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

		$scope.get_client =
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

		this.get_estimated =
			function(id) {
				return JSON.parse($scope.cost_center.remarks)[id];

			}

		this.toggle =
			function(id) {
				var idx = $scope.checked_list.indexOf(id);
				if (idx > -1) {
					$scope.checked_list.splice(idx, 1);
					delete $scope.costcenter_params.selectedLabProducts[id];
				}
				else {
					$scope.checked_list.push(id);
				}
			}


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
					'location': costcenter_params.selectedEstimatedCost,
					'rights': costcenter_params.selectedAmount,
					'expirationDate': Utility.format_date(costcenter_params.selectedExpirationDate),
					'Remarks': JSON.stringify(costcenter_params.selectedLabProducts),
				}
				$scope.loading_update.show();
				BikaService.updateSupplyOrder(this.params).success(function (data, status, header, config){
					this.result = data.result;
					if (this.result['success'] === 'True') {
						Utility.alert({title:'Success', content: 'Center Cost '+$scope.cost_center.title+' has been edited', alertType:'success'});
						if (Array.isArray($scope.costcenter_params.selectedBatches) &&  $scope.costcenter_params.selectedBatches.length > 0) {
                    		_.each($scope.costcenter_params.selectedBatches, function(batch){
                    			obj_id = $scope.state.costcenter_id;
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

							$state.go('cost_center',{'costcenter_id': $scope.cost_center.id},{reload: true});
                    	}
                    	else {
							$scope.loading_update.hide();
							Utility.alert({title:'Success', content: 'Your Cost Center has been successfully edited', alertType:'success'});
							$state.go('cost_center',{'costcenter_id': $scope.cost_center.id},{reload: true});

                    	}

					}
					else {
						Utility.alert({title:'Error while editing...', content: result['message'], alertType:'danger'});
						return;
					}
				});

			}

		this.get_partial_amount =
			function(){
				$scope.stats.start = true;
				this.params = {sort_on: 'keyword', sort_order: 'ascending',}
                BikaService.getAnalysisServices(this.params).success(function (data, status, header, config){
                	var analyses_services = data.result.objects;
					var batch_ids = [];
					_.each($scope.batches, function(batch) {
						batch_ids.push(batch.id);
					});
					this.ar_params = {sort_on: 'getId', sort_order: 'ascending', titles: batch_ids.join('|')};
					BikaService.getAnalysisRequests(this.ar_params).success(function (data, status, header, config){
						this.analysis_requests = data.result.objects;
						var ids = Array();
						var counter = 0;
						_.each(this.analysis_requests, function(ar){
							console.log(ar.review_state);
							if ((ar.sample_type != 'POOL' || ar.sample_type != 'FLOWCELL') && ar.state_review=='published') {counter++;}
							_.each(ar.analyses, function(a){
								if (_.indexOf(ids, a.id) == -1) {ids.push(a.id);}
							});
						});

						var amount = 0;
						_.each(ids, function(id) {
							service = _.findWhere(analyses_services, {'keyword': id})
							this.amount = parseInt(service.price.replace('.00',''));

							amount+=this.amount;
						});

						$scope.stats.amount = amount*counter;
						$scope.stats.start = false;
					});
				});

			}

		$scope.$watch('stats.amount',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
					radialProgress(document.getElementById('divAmount'))
						.diameter(200)
						.value(Utility.percentage($scope.stats.amount, $scope.cost_center.rights))
						.render();
			});


});