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

		$scope.state = {content:Utility.format_html($stateParams.content)};
		$scope.attachment = {content:[], sample_list:[], samplesheet: JSON.parse($scope.state.content)};

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
			switchMode: false,
		};

		$scope.reads = config.bikaApiRest.data_source.reads;
		$scope.indexes = config.bikaApiRest.data_source.indexes;

	 	this.link_samplesheet =
	 		function(samplesheet_params) {
				this.params = {
					illumina_run_directory: samplesheet_params.run_folder.running_folder,
				 	samplesheet: JSON.stringify($scope.attachment.samplesheet),
				 	run: samplesheet_params.run_folder.running_folder,
				 	fcid: samplesheet_params.fcid,
				 	read1_cycles: samplesheet_params.r1,
				 	read2_cycles: samplesheet_params.r2,
				 	index1_cycles: samplesheet_params.i1,
				 	index2_cycles: samplesheet_params.i2,
				 	is_rapid: samplesheet_params.switchMode.toString(),
				};
				IrodsService.putSamplesheet(this.params).success(function (data, status, header, config){
					console.log(data.result);
				});

				console.log(this.params);
	 		}

		$scope.$watch('samplesheet_params.run_folder',
            function (newValue, oldValue) {
                // Ignore initial setup.
                if ( newValue === oldValue) { return;}
                if ( newValue === null || newValue == undefined ) {  return; }

                pieces = newValue.running_folder.split('_')

                $scope.samplesheet_params.fcid = pieces[3].substring(1);
                $scope.samplesheet_params.date = "20"+pieces[0].substring(0,2)+"/"+pieces[0].substring(2,4)+"/"+pieces[0].substring(4,6);
                $scope.samplesheet_params.instrument = config.instruments[pieces[1]];
            }
        );

});