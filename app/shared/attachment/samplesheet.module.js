var samplesheet_module = angular.module('SamplesheetModule',[]);

samplesheet_module.run(function($rootScope){
  $rootScope._ = _;
});

samplesheet_module.controller('SamplesheetCtrl',
	function(BikaService, Utility, $stateParams, config, $scope, $rootScope) {

		$scope.batch = [];
		$scope.analysis_requests = [];
		$scope.review_state = 'active';
		$scope.state = {batches: $stateParams.batches.split(','), content:Utility.format_html($stateParams.content)};
		$scope.attachment = {content:[], sample_list:[], samplesheet: []};

		//console.log($stateParams.batches);
		$scope.loading_batch = Utility.loading({
            busyText: 'Wait while loading batch data...',
            delayHide: 500,
        });

        $scope.loading_ars = Utility.loading({
            busyText: 'Wait while loading analyses...',
            delayHide: 500,
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
});

