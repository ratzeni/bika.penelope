var samplesheet_module = angular.module('SamplesheetModule',[]);

samplesheet_module.run(function($rootScope){
  $rootScope._ = _;
});

samplesheet_module.controller('SamplesheetCtrl',
	function(BikaService, Utility, $stateParams, $state, config, $scope, $rootScope) {

		$scope.batch = [];
		$scope.analysis_requests = [];
		$scope.review_state = 'active';
		$scope.state = {batches: $stateParams.batches.split(','), content:Utility.format_html($stateParams.content)};
		$scope.attachment = {content:[], sample_list:[], samplesheet: []};

		//console.log($stateParams.batches);
		$scope.loading_batch = Utility.loading({
            busyText: 'Wait while loading batch data...',
            delayHide: 1000,
        });

        $scope.loading_ars = Utility.loading({
            busyText: 'Wait while loading analyses...',
            delayHide: 1000,
        });


		$scope.init =
			function(content) {
				_.each(JSON.parse(content), function(c) {
					row = c.split(',');
					$scope.attachment.content.push(row);
				});
		};

        $scope.getAnalysisRequests =
            function(batches) {
            	$scope.loading_ars.show();
                $scope.analysis_requests = [];
                this.batch_params = {sort_on: 'getId', sort_order: 'ascending', titles: batches.join('|')};


				params['Subjects'] = 'sample_due|sample_received|to_be_verified|verified|published';

				BikaService.getBatches(this.batch_params) .success(function (data, status, header, config){
					var batch_ids = [];
					_.each(data.result.objects, function(batch) {
						batch_ids.push(batch.id);
					});
					this.ar_params = {sort_on: 'getId', sort_order: 'ascending', titles: batch_ids.join('|')};

					BikaService.getAnalysisRequests(this.ar_params).success(function (data, status, header, config){
						var analysis_requests = data.result.objects;
						var start_sample_list = false;
						var samplesheet = [];

						_.each($scope.attachment.content, function(row) {
							if (start_sample_list) {
								this.row = row.slice(0);
								this.client_sample_id = row[1];
								this.ar = _.findWhere(analysis_requests, {'client_sample_id': this.client_sample_id});
								if (this.ar !== undefined) {
									this.row[1] = this.ar.id;
									this.row[2] = this.client_sample_id;
									samplesheet.push(this.row);
								}
							}
							else {samplesheet.push(row);}
							if (_.indexOf(row,'Sample_ID') !== -1){
								start_sample_list = true;
							}
						});

						$scope.attachment.samplesheet = samplesheet;
						$scope.attachment.content = samplesheet;
                	});

				});

            };

		this.get_filename =
			function () {
				return 'samplesheet.'+Utility.format_date()+'.csv'
			}
		$scope.init($scope.state.content);
        $scope.getAnalysisRequests($scope.state.batches);

        this.link2Run =
        	function(content) {
        		$state.go('samplesheet_link2run', {'content': JSON.stringify(content)});
        	}
});

samplesheet_module.controller('Link2RunCtrl',
	function(BikaService, IrodsService, Utility, $stateParams, $state, config, $scope, $rootScope) {
		//$scope.run_folders = ['160210_SN526_0254_BHGC35BCXX','160226_SN526_0255_BC8490ACXX','160308_SN526_0256_BC7WNWACXX'];

		$scope.attachment = {content:[], sample_list:[], samplesheet: []};

		if ($stateParams.content !== undefined) {
			$scope.state = {content:Utility.format_html($stateParams.content)};
			$scope.attachment = {content:[], sample_list:[], samplesheet: JSON.parse($scope.state.content)};
		}

		$scope.get_running_folders =
			function() {
				this.params = {}
				IrodsService.getRunningFolders(this.params).success(function (data, status, header, config){
					$scope.run_folders = data.result.objects;
				});
			}

		$scope.get_running_folders();

		$scope.samplesheet_params = {
			run_folder: null,
			fcid: null,
			date: null,
			instrument: null,
			switchReads: false,
			r1: null,
			r2: null,
			switchIndexes: false,
			i1: null,
			i2: null,
			switchMode: true,
			attachment: null,
			samplesheet: $scope.attachment.samplesheet.length>0?$scope.attachment.samplesheet:null,
		};

		$scope.reads = config.bikaApiRest.data_source.reads;
		$scope.indexes = config.bikaApiRest.data_source.indexes;

	 	$scope.link_samplesheet =
	 		function(samplesheet_params) {
				this.params = {
					illumina_run_directory: samplesheet_params.run_folder.running_folder,
				 	samplesheet: JSON.stringify(samplesheet_params.samplesheet),
				 	run: samplesheet_params.run_folder.running_folder,
				 	fcid: samplesheet_params.fcid,
				 	read1_cycles: samplesheet_params.r1.value,
				 	read2_cycles: samplesheet_params.r2!=null?samplesheet_params.r2.value:'',
				 	index1_cycles: samplesheet_params.i1.value,
				 	index2_cycles: samplesheet_params.i2!=null?samplesheet_params.i2.value:'',
				 	is_rapid: samplesheet_params.switchMode.toString(),
				};

				IrodsService.putSamplesheet(this.params).success(function (data, status, header, config){
					if (data.result.success === 'True') {
						Utility.alert({title:'Success', content: 'Samplesheet has been successfully imported', alertType:'success'});
					}
					else {
						Utility.alert({title:'There\'s been an error<br/>',
	 					content: data.result.error.join(" ") + " " +  data.result.objects.join(" "),
	 					alertType:'danger'});
					}

				});
	 		}

	 	this.submit =
	 		function(samplesheet_params) {
	 			//check samplesheet
	 			var samples = Array();
	 			var lanes = {};
	 			var start_sample_list = false;
	 			var ilanes = 0;
	 			var isampleid = 0;
	 			_.each(samplesheet_params.samplesheet, function(row) {
	 				if (start_sample_list) {
	 					if (row[ilanes] !== undefined && row[ilanes] !== ''  && !isNaN(row[ilanes])) {
	 						lanes[row[ilanes]] = true;
	 					}
	 					if (_.indexOf(samples,row[isampleid]) === -1 && row[isampleid] !== undefined && row[isampleid] !== '') {
	 						samples.push(row[isampleid]);
	 					}

					}

					if (_.indexOf(row,'Sample_ID') !== -1){
						start_sample_list = true;
						isampleid = _.indexOf(row,'Sample_ID');
						ilanes = _.indexOf(row,'Lane');

					}
	 			});

	 			if (_.keys(lanes).length < 8) {
	 				Utility.alert({title:'There\'s been an error<br/>',
	 					content: "Only "+_.keys(lanes).length +" lanes: "+ _.keys(lanes).join(','),
	 					alertType:'danger'});
	 				return;
	 			}
	 			this.params = {ids: samples.join('|')}
	 			BikaService.getAnalysisRequests(this.params).success(function (data, status, header, config){
	 				if (data.result.objects.length < samples.length) {
	 					unknows = Array();

						_.each(samples, function(sample) {
							if (_.findWhere(data.result.objects, {'id': sample}) === undefined) {
								unknows.push(sample);
							}
						});

						Utility.alert({title:'There\'s been an error<br/>',
							content: "Unknown samples: \n" + unknows.join('\n'),
							alertType:'danger'});

						return;
	 				}
	 				else {
	 					$scope.link_samplesheet(samplesheet_params);
	 				}
	 			});


	 		}

		$scope.$watch('samplesheet_params.run_folder',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null || newValue == undefined || newValue.running_folder === '') {
                	$scope.samplesheet_params.fcid = null;
                	$scope.samplesheet_params.date = null;
                	$scope.samplesheet_params.instrument = null;
                	return;
                }

                pieces = newValue.running_folder.split('_')

                $scope.samplesheet_params.fcid = pieces[3].substring(1);
                $scope.samplesheet_params.date = "20"+pieces[0].substring(0,2)+"/"+pieces[0].substring(2,4)+"/"+pieces[0].substring(4,6);
                $scope.samplesheet_params.instrument = config.instruments[pieces[1]];
            });

		$scope.$watch('attachment.samplesheet',
            function (newValue, oldValue) {

            	if ( newValue === oldValue) { return;}
                if ( newValue === null || newValue == undefined || newValue == []) {
                	$scope.samplesheet_params.samplesheet = [];
                	return;
                }

                $scope.samplesheet_params.samplesheet = $scope.attachment.samplesheet;
            });

        $scope.$watch('samplesheet_params.attachment',
            function (newValue, oldValue) {
            	// Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null ) {
                	$scope.samplesheet_params.samplesheet = [];
                	return;
                }

				var reader = new FileReader();
				reader.onload = function(event) {
					var data = event.target.result.replace(/\r/g,"");
					data = data.replace(/"/g,"");

					$scope.attachment.samplesheet = Array();
					_.each(data.split('\n'), function(row) {
						if (row.length > 1) {
							$scope.attachment.samplesheet.push(JSON.parse(JSON.stringify(row.split(','))));
						}

					});
					$scope.restart();

				};
				reader.readAsText($scope.samplesheet_params.attachment);
            });

        $scope.restart =
        	function(){
        		BikaService.checkStatus().success(function (data, status, header, config){
				   resut = data;
				});
			}



});