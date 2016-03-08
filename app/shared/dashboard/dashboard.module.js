var dashboard_module = angular.module('DashboardModule',[]);

dashboard_module.run(function($rootScope){
  	$rootScope._ = _;
  	$rootScope.counter = {
  			batches: -1,
  			active: -1,
			sample_due: -1,
			sample_received: -1,
			verified: -1,
			published: -1,
			worksheets: -1,
			assigned: -1,

	}

});

dashboard_module.service('DashboardService', function(BikaService, $rootScope) {
		var counter = $rootScope.counter;

 		this.samples_review_state = ['sample_due','sample_received'];
		this.ars_review_state = ['active', 'published','verified'];
		this.services_review_state = ['to_be_verified'];
		this.worksheets_review_state = ['assigned','worksheets'];
		this.batches_review_state = ['batches'];

		update_counter =
			function (review_state, count, counter) {
				counter[review_state] = parseInt(count);
			}

		countAnalysisRequests =
			function(review_state) {
				params = {sort_on: 'Date', sort_order: 'descending',
                		page_nr: 0, page_size: 1, include_fields: 'path'};

                if (review_state === 'active') {
					params['Subjects'] = 'sample_due|sample_received|to_be_verified|verified|published';
				}
				else {
					params['Subject'] = review_state;
				}

                BikaService.countAnalysisRequests(params).success(function (data, status, header, config){
					var count = data.result;
					update_counter(review_state, count, counter);
                });
		}

		countSamples =
			function(review_state) {
                params = {sort_on: 'id', sort_order: 'descending', Subject: review_state, include_fields: 'path', page_nr: 0, page_size: 1};
                BikaService.countAnalysisRequests(params).success(function (data, status, header, config){
					var count = data.result;
					update_counter(review_state, count, counter);
                });
			}

		countWorksheets =
			function(review_state) {
                params = {sort_on: 'id', sort_order: 'descending', Subject: 'open'};

                BikaService.getWorksheets(params).success(function (data, status, header, config){
					var worksheets = data.result.objects;
					var analyst = $rootScope.currentUser.userid;
					var count = 0;
					if (review_state === 'assigned') {
						_.each(worksheets, function(w) {

							if (w.remarks != undefined && w.remarks != null &&  w.remarks != '' && analyst == w.analyst) {
								analyses = JSON.parse(w.remarks);
								count = count +  analyses.length;
								//console.log(count);
							}

						});
					}
					else if (review_state === 'worksheets') {
						count =  worksheets.length;
					}
					update_counter(review_state, count, counter);
                });
			}

		countBatches =
			function(review_state) {
                params = {sort_on: 'id', sort_order: 'descending', Subject: 'open', page_nr: 0, page_size: 1};
                BikaService.getBatches(params).success(function (data, status, header, config){
					var count = data.result.total;
					update_counter(review_state, count, counter);
                });
			}


		this.update_dashboard =
			function () {
				_.each(this.ars_review_state,function(review_state) {
					update_counter(review_state, -1, $rootScope.counter);
					countAnalysisRequests(review_state);
				});
				_.each(this.samples_review_state,function(review_state) {
					update_counter(review_state, -1, $rootScope.counter);
					countSamples(review_state);
				});
				_.each(this.services_review_state,function(review_state) {
					update_counter(review_state, -1, $rootScope.counter);
					countAnalysisRequests(review_state);
				});
				_.each(this.worksheets_review_state,function(review_state) {
					update_counter(review_state, -1, $rootScope.counter);
					countWorksheets(review_state);
				});
				_.each(this.batches_review_state,function(review_state) {
					update_counter(review_state, -1, $rootScope.counter);
					countBatches(review_state);
				});
				return counter;
			}

		return this;
});
