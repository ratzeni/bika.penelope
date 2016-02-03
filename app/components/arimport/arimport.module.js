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
				if (($scope.arimport_params.selectedSampleType.prefix === 'FC' || $scope.arimport_params.selectedSampleType.prefix === 'POOL')
					&& $scope.arimport_params.attachment_content==null) {
					Utility.alert({title:'There\'s been an error<br/>', content:'Missing attachment', alertType:'danger'});
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
					subject: 'open',
				}

				BikaService.createBatch(params).success(function (data, status, header, config){

					function get_environmental_conditions(sample_data, selectedSampleType) {
						values = [];
						if ((selectedSampleType.prefix !== 'FC' && selectedSampleType.prefix !== 'POOL') || sample_data.index === 1) {
							var sample_header = $scope.header;
						}
						else {var sample_header = $scope.attachment_header;}

						if (_.size(sample_data) > 2) {
							_.each(sample_header,function(obj) {
								values.push($scope.format_csv_field(obj)+"="+sample_data[$scope.format_csv_field(obj)]);
							});
							return values.join('|');
						}
						return "";

					}

					function get_remarks(sample_data, arimport_params) {
						remarks = (arimport_params.attachment_content!=null && sample_data.index==1)?JSON.stringify(arimport_params.attachment_content):'';
						return remarks;
					}

					function get_sample_type(sample_data, selectedSampleType) {
						if ((selectedSampleType.prefix !== 'FC' && selectedSampleType.prefix !== 'POOL') || sample_data.index === 1) {
							return selectedSampleType.id;
						}
						else if ((selectedSampleType.prefix === 'FC' || selectedSampleType.prefix === 'POOL') && sample_data.index !== 1) {
							sample_type = _.findWhere($scope.sample_types, {'prefix': 'SAMPLE-IN-'+selectedSampleType.prefix});
							if (sample_type !== undefined) {
								return sample_type.id;
							}
						}
						else {return selectedSampleType.id;}
					}

                    result = data.result;
                    if (result['success'] === 'True') {
                    	$scope.outcome.batch_id = result['obj_id']

						var services = Array();
						_.each(arimport_params.selectedAnalysisServices, function(as) {
							services.push(as.id);
						});
						var contacts = Array();
						_.each(arimport_params.selectedCCContact, function(c) {
							contacts.push(c.id);
						});

                    	// creating analysis request
                    	_.each(arimport_params.client_samples, function(client_samples) {
                    		params = {
								title: $scope.outcome.batch_id,
								Client: arimport_params.selectedClient.id,
								ClientSampleID: client_samples.sample,
								SampleType: get_sample_type(client_samples, arimport_params.selectedSampleType),
								SamplingDate: Utility.format_date(arimport_params.selectedSamplingDate),
								Batch: $scope.outcome.batch_id,
								EnvironmentalConditions: get_environmental_conditions(client_samples, arimport_params.selectedSampleType),
								Contact: arimport_params.selectedContact.id,
								CCContact: contacts.length>0?contacts.join('|'):arimport_params.selectedContact.id,
								Services: services.join('|'),
								Remarks: get_remarks(client_samples, arimport_params),
								subject: 'sample_due',
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

                    	});

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
                    $scope.batches = data.result.objects;
                });
            };

		// :: function :: getClients()
        $scope.getClients =
            function(arimport_params) {
                $scope.clients = [];
                params = {};
                BikaService.getClients(params).success(function (data, status, header, config){
                    $scope.clients = data.result.objects;
                });
            };

		// :: function :: getContacts()
        $scope.getContacts =
            function(arimport_params) {
                $scope.contacts = [];
                params = arimport_params.selectedClient != null ? {client_id: arimport_params.selectedClient.id} : {}
                BikaService.getContacts(params).success(function (data, status, header, config){
                    $scope.contacts = data.result.objects;
                });
            };

		// :: function :: getCCContacts()
        $scope.getCCContacts =
            function(arimport_params) {
                params = arimport_params.selectedClient != null ? {client_id: arimport_params.selectedClient.id} : {}
                BikaService.getContacts(params).success(function (data, status, header, config){
                    $scope.cc_contacts = data.result.objects;
                });
            };

		// :: function :: getSampleTypes()
        $scope.getSampleTypes =
            function(arimport_params) {
                params = {}
                BikaService.getSampleTypes(params).success(function (data, status, header, config){
                    $scope.sample_types = data.result.objects;
                });
            };


		// :: function :: getAnalysisProfiles()
        $scope.getAnalysisProfiles =
            function(arimport_params) {
                params = {}
                BikaService.getAnalysisProfiles(params).success(function (data, status, header, config){
                    $scope.analysis_profiles = data.result.objects;
                });
            };

		// :: function :: getAnalysisServices()
        $scope.getAnalysisServices =
            function(arimport_params) {
                params = {}
                BikaService.getAnalysisServices(params).success(function (data, status, header, config){
                    $scope.analysis_services = data.result.objects;
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
   					//$scope.getAnalysisProfiles();
   					$scope.getAnalysisServices();
   					$scope.getBatches();
   					$scope.getExportMode();
                }
            };

        $scope.update([]);

        $scope.arimport_params = {
        	switchAR: true,
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
        	client_samples: [],
        	single_sample: null,
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

		$scope.$watch('arimport_params.switchAR',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                $scope.header = [];
                $scope.arimport_params.client_samples = [];
                $scope.arimport_params.single_sample = null;
                $scope.arimport_params.uploadFile = null;

            });

         $scope.$watch('arimport_params.single_sample',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null || newValue === '') {
                	$scope.header = [];
                	$scope.arimport_params.client_samples = [];
                }
                if ( newValue !== null || newValue !=='') {
                	$scope.arimport_params.client_samples = [{index: 1, sample: $scope.arimport_params.single_sample}];
                }
            });

        $scope.$watch('arimport_params.uploadFile',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null ) { $scope.arimport_params.client_samples; return; }

				var reader = new FileReader();
				reader.onload = function(event) {
					var data = event.target.result;
					ret_data = $scope.retrieveCSV(data);
					$scope.arimport_params.client_samples = ret_data.data;
					$scope.header = ret_data.header;
					$scope.getAnalysisProfiles();
				};

				reader.readAsText($scope.arimport_params.uploadFile);
            });

        $scope.$watch('arimport_params.attachment',
            function (newValue, oldValue) {

            	function extract_samples(content, sample_type) {
					var samples = Array();
					var index = 2;
					if (sample_type === 'FC')
					{
						var start_sample_list = false;
						_.each(content, function (row) {
							if (start_sample_list) {
								sample_data = row.split(',');
								if (sample_data.length > 1 && _.findWhere(samples, {sample: sample_data[1]}) === undefined) {
									samples.push({index: index, sample: $scope.format_csv_field(sample_data[1])});
									index++;
								}

							}
							if (row.search('Lane,Sample_ID,Sample_Name') != -1) {
								start_sample_list = true;
							}
						});

					}
					else if (sample_type === 'POOL')
					{
						ret_data = $scope.retrieveCSV(content, true);
						samples = ret_data.data;
						$scope.header = ret_data.header;
					}
					return samples;
            	}
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null ) {
                	$scope.arimport_params.client_samples = [];
                	return;
                }

				var reader = new FileReader();
				reader.onload = function(event) {
					var data = event.target.result;
					$scope.arimport_params.attachment_content = Array()
					_.each(data.split('\n'), function(row) {
						$scope.arimport_params.attachment_content.push($scope.format_csv_field(row));
					});

					var client_samples = extract_samples($scope.arimport_params.attachment_content, $scope.arimport_params.selectedSampleType.prefix);
					$scope.arimport_params.client_samples = _.union($scope.arimport_params.client_samples, client_samples);
					$scope.getAnalysisProfiles();
					//console.log(client_samples);
				};

				reader.readAsText($scope.arimport_params.attachment);
            });

		$scope.retrieveCSV =
			function(data, is_attachment) {
				var ret_data = Array();
				var lines = is_attachment===undefined?data.split('\n'):data;
				header = lines[0].split(',')

				for(var i = 0; i < lines.length-1; i++){
					sample_data = lines[i].split(',');
					if (sample_data.length > 0 ) {
						ret_data[i]={index:is_attachment===undefined?i:i+1, sample: $scope.format_csv_field(sample_data[0])};
						if (sample_data.length > 1) {
							for (j = 1; j < sample_data.length; j++) {
								header[j] = $scope.format_csv_field(header[j]);
								ret_data[i][$scope.format_csv_field(header[j])] = $scope.format_csv_field(sample_data[j]);
							}
						}
					}
				}
				ret_data.shift();
				header.shift();
				//console.log(ret_data);
				return {data: ret_data, header: header};
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

