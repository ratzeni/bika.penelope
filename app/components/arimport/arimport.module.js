var arimport_module = angular.module('ARImportModule',[]);

arimport_module.run(function($rootScope){
  $rootScope._ = _;
});

arimport_module.controller('ARImportCtrl',
	function(BikaService, Utility, config, $state, $scope) {

		$scope.arimportForm = {};
		$scope.loading_import = Utility.loading({
            busyText: 'Wait while importing...',
            delayHide: 3000,
        });

		$scope.submit =
			function(arimport_params) {

				function batch_exists(batch, batches) {
					found = _.findWhere(batches, {'title': batch});
					if (found === undefined) { return false; }
					else { return true; }
				}

				$scope.submitted = true;
				if (batch_exists($scope.arimport_params.selectedBatch, $scope.batches)) {
					Utility.alert({title:'There\'s been an error<br/>', content:'Batch ' + $scope.arimport_params.selectedBatch + ' already exists', alertType:'danger'});
					return;
				}
				if (_.size($scope.arimport_params.client_samples) == 0) {
					Utility.alert({title:'There\'s been an error<br/>', content:'CSV file required', alertType:'danger'});
					return;
				}
				if ($scope.arimport_params.selectedClient === null || $scope.arimport_params.selectedClient === undefined) {
					Utility.alert({title:'There\'s been an error<br/>', content:'Client field required', alertType:'danger'});
					return;
				}
				if ($scope.arimport_params.selectedContact === null || $scope.arimport_params.selectedContact === undefined) {
					Utility.alert({title:'There\'s been an error<br/>', content:'Contact field required', alertType:'danger'});
					return;
				}
				if ($scope.arimport_params.selectedSampleType === null || $scope.arimport_params.selectedSampleType === undefined) {
					Utility.alert({title:'There\'s been an error<br/>', content:'SampleType field required', alertType:'danger'});
					return;
				}
				if ($scope.arimport_params.selectedAnalysisServices === null || $scope.arimport_params.selectedAnalysisServices === undefined) {
					Utility.alert({title:'There\'s been an error<br/>', content:'Analysis Service field required', alertType:'danger'});
					return;
				}
				if ($scope.arimport_params.selectedBatch === null || $scope.arimport_params.selectedBatch === undefined) {
					Utility.alert({title:'There\'s been an error<br/>', content:'Batch field required', alertType:'danger'});
					return;
				}
				if ($scope.arimport_params.textDescription === null || $scope.arimport_params.textDescription === undefined) {
					Utility.alert({title:'There\'s been an error<br/>', content:'Description field required', alertType:'danger'});
					return;
				}

				if (!$scope.arimportForm.$invalid && _.size($scope.arimport_params.client_samples) > 0) {
					$scope.import(arimport_params);
				} else {
					Utility.alert_danger({title:'There\'s been an error<br/>', content:'Error', alertType:'danger'});

					return;
				}
				//$scope.loading.hide();
			};

		// :: function :: ARImport()
		$scope.import =
			function(arimport_params) {

				$scope.loading_import.show()
				$scope.outcome = {
					batch_id: null,
					arequest_ids: [],
				}
				// creating batch
				params = {
					title: arimport_params.selectedBatch,
					description: arimport_params.textDescription,
					ClientBatchID: arimport_params.selectedBatch,
					BatchDate: Utility.format_date(arimport_params.selectedSamplingDate),
					Client: arimport_params.selectedClient.id,
					Remarks: arimport_params.selectedExportMode.label,
				}

				BikaService.createBatch(params).success(function (data, status, header, config){

					function get_environmental_conditions(sample_data) {
						values = [];
						if (_.size(sample_data) > 2) {
							_.each($scope.header,function(obj) {
								values.push($scope.format_csv_field(obj)+"="+sample_data[$scope.format_csv_field(obj)]);
							});
							return values.join('|');
						}
						return "";

					}

                    result = data.result;
                    if (result['success'] === 'True') {
                    	$scope.outcome.batch_id = result['obj_id']

                    	// creating analysis request
						for (var si in $scope.arimport_params.client_samples) {
							services = []
							for (var i=0; i< arimport_params.selectedAnalysisServices.length; i++) {
								services[i] = arimport_params.selectedAnalysisServices[i].id;
							}
							contacts = []
							for (var i=0; i< arimport_params.selectedCCContacts.length; i++) {
								contacts[i] = arimport_params.selectedCCContacts[i].id;
							}

							params = {
								title: $scope.outcome.batch_id,
								Client: arimport_params.selectedClient.id,
								ClientSampleID: arimport_params.client_samples[si].sample,
								SampleType: arimport_params.selectedSampleType.id,
								SamplingDate: Utility.format_date(arimport_params.selectedSamplingDate),
								Batch: $scope.outcome.batch_id,
								EnvironmentalConditions: get_environmental_conditions(arimport_params.client_samples[si]),
								Contact: arimport_params.selectedContact.id,
								CCContact: contacts.length>0?contacts.join('|'):arimport_params.selectedContact.id,
								Services: services.join('|'),

								Remarks: $scope.arimport_params.attachment_content!=null?JSON.stringify($scope.arimport_params.attachment_content):'',
							}

							BikaService.createAnalysisRequest(params).success(function (data, status, header, config){
								result = data.result;
								if (result['success'] === 'True') {
									$scope.outcome.arequest_ids.push({ar_id:result['ar_id'], sample_id:result['sample_id']});
								}
								else {
									console.log(result['message']);
									$scope.loading_import.hide();
									Utility.alert({title:'Error while importing...', content: result['message'], alertType:'danger'});
									return;
								}
							});
						}
						$scope.loading_import.hide();
						Utility.alert({title:'Success', content: 'Your AR has been successfully imported', alertType:'success'});
						$state.go('batch',{batch_id: $scope.outcome.batch_id});
                    }
                    else {
                    	console.log(result['message']);
                    	$scope.loading_import.hide();
                    	Utility.alert({title:'There\'s been an error<br/>', content: result['message'], alertType:'danger'});

                    	return;
                    }
                });
			}

		// :: function :: getBatches()
        $scope.getBatches =
            function(arimport_params) {
                $scope.batches = [];
                params = {};
                BikaService.getBatches(params).success(function (data, status, header, config){
                    $scope.batches = data.result;
                });
            };

		// :: function :: getClients()
        $scope.getClients =
            function(arimport_params) {
                $scope.clients = [];
                params = {};
                BikaService.getClients(params).success(function (data, status, header, config){
                    $scope.clients = data.result;
                });
            };

		// :: function :: getContacts()
        $scope.getContacts =
            function(arimport_params) {
                $scope.contacts = [];
                params = arimport_params.selectedClient != null ? {client_id: arimport_params.selectedClient.id} : {}
                BikaService.getContacts(params).success(function (data, status, header, config){
                    $scope.contacts = data.result;
                });
            };

		// :: function :: getCCContacts()
        $scope.getCCContacts =
            function(arimport_params) {
                params = arimport_params.selectedClient != null ? {client_id: arimport_params.selectedClient.id} : {}
                BikaService.getContacts(params).success(function (data, status, header, config){
                    $scope.cc_contacts = data.result;
                });
            };

		// :: function :: getSampleTypes()
        $scope.getSampleTypes =
            function(arimport_params) {
                params = {}
                BikaService.getSampleTypes(params).success(function (data, status, header, config){
                    $scope.sample_types = data.result;
                });
            };


		// :: function :: getAnalysisProfiles()
        $scope.getAnalysisProfiles =
            function(arimport_params) {
                params = {}
                BikaService.getAnalysisProfiles(params).success(function (data, status, header, config){
                    $scope.analysis_profiles = data.result;
                });
            };

		// :: function :: getAnalysisServices()
        $scope.getAnalysisServices =
            function(arimport_params) {
                params = {}
                BikaService.getAnalysisServices(params).success(function (data, status, header, config){
                    $scope.analysis_services = data.result;
                });
            };

        // :: function :: getExportMode()
        $scope.getExportMode =
            function() {
                $scope.export_mode = config.bikaApiRest.data_source.export_mode;
            };

        // :: function :: update()
        $scope.update =
            function(arimport_params, target) {

                if (_.size(arimport_params) === 0) {
                    $scope.getClients();
                    $scope.getSampleTypes();
   					$scope.getAnalysisProfiles();
   					$scope.getAnalysisServices();
   					$scope.getBatches();
   					$scope.getExportMode();
                }
            };

        $scope.update([]);

        $scope.arimport_params = {
            selectedClient: null,
            selectedContact: null,
        	selectedCCContacts: null,
        	selectedSampleType: null,
        	selectedContainerType: null,
        	selectedAnalysisProfiles: null,
        	selectedAnalysisServices: null,
        	selectedSamplingDate: Utility.format_date(),
        	selectedBatch: null,
        	selectedExportMode: $scope.export_mode[0],
        	textDescription: null,
        	uploadFile: null,
        	attachment: null,
        	attachment_content: null,
        };

        $scope.$watch('arimport_params.selectedClient',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null ) {
                	$scope.contacts = [];
                	$scope.cc_contacts = [];
                	$scope.batches = null;
                	$scope.batches_tags = null;
                	return; }
                $scope.getContacts($scope.arimport_params);
				$scope.getCCContacts($scope.arimport_params);
				$scope.batches_tags = null;
				//$scope.getBatches($scope.arimport_params);
            }
        );

        $scope.$watch('arimport_params.selectedSampleType',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null || newValue == undefined ) { $scope.arimport_params.selectedContainerType = null; return; }
                $scope.arimport_params.selectedContainerType = newValue.container_type;
            }
        );

        $scope.$watch('arimport_params.uploadFile',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null ) { return; }

				var reader = new FileReader();
				reader.onload = function(event) {
					var data = event.target.result;
					$scope.arimport_params.client_samples = $scope.retrieveCSV(data);
					$scope.getClients();
				};

				reader.readAsText($scope.arimport_params.uploadFile);
            });

        $scope.$watch('arimport_params.attachment',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null ) { return; }

				var reader = new FileReader();
				reader.onload = function(event) {
					var data = event.target.result;
					$scope.arimport_params.attachment_content = data.split('\n');
					//console.log($scope.arimport_params.attachment_content);
					//console.log($scope.arimport_params.attachment_content.toString());
					//console.log(JSON.stringify($scope.arimport_params.attachment_content));

					//$scope.getClients();
				};

				reader.readAsText($scope.arimport_params.attachment);
            });

		$scope.retrieveCSV =
			function(data) {
				var ret_data = Array();
				var lines = data.split('\n');
				$scope.header = lines[0].split(',')

				for(var i = 0; i < lines.length-1; i++){
					sample_data = lines[i].split(',');
					if (sample_data.length > 0 ) {
						ret_data[i]={index:i, sample: $scope.format_csv_field(sample_data[0])};
						if (sample_data.length > 1) {
							for (j = 1; j < sample_data.length; j++) {
								ret_data[i][$scope.format_csv_field($scope.header[j])] = $scope.format_csv_field(sample_data[j]);
							}
						}
					}
				}
				ret_data.shift();
				$scope.header.shift();
				//console.log(ret_data);
				return ret_data;
			}

		this.format_csv_field = function(field) {
			return Utility.format_csv_field(field);
		}

		$scope.format_csv_field = function(field) {
			return Utility.format_csv_field(field);
		}

		$scope.sort = function(keyname){
			$scope.sortKey = keyname;   //set the sortKey to the param passed
			$scope.reverse = !$scope.reverse; //if true make it false and vice versa
		}


});

