var utility_module = angular.module('UtilityModule', []);

utility_module.run(function($rootScope){
  $rootScope._ = _;
});

utility_module.service('Utility',
	function(config, $loading, $alert, $window) {


		this.loading = function(params) {

			if (params.busyText  === undefined) {
				params.busyText  = 'Wait while loading...';
			}
			if (params.theme === undefined) {
				params.theme = 'info';
			}
			if (params.timeout === undefined) {
				params.timeout = false;
			}
			if (params.showBar === undefined) {
				params.showBar = true;
			}
			if (params.delayHide === undefined) {
				params.delayHide = 1000;
			}

			var loading = new $loading({
				busyText: params.busyText,
				theme: params.theme,
				timeout: params.timeout,
				showBar: params.showBar,
				delayHide: params.delayHide,
			});

			return loading;
		}

		this.format_date = function(date) {
			if (date === undefined) {
				time = new Date();
			}
			else {
				time = new Date(date);
			}
			return time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()
		}

		this.format_review_state = function(review_state) {
			if (review_state === undefined) {return "";}
			if (review_state === 'sample_received') {review_state = 'received';}
			var str = review_state.replace(/_/g, ' ');
			var pieces = str.split(" ");
			for (var i = 0; i < pieces.length; i++) {
				pieces[i] = pieces[i].charAt(0).toUpperCase()+ pieces[i].slice(1);
			}
			return pieces.join(" ");
		}

		this.format_result = function(result) {
			if (result.length == 0) {
				return config.legend.analysis_result_todo;
			}
			return config.legend.analysis_result[result];

		}

		this.format_csv_field = function(field) {
			return field.replace(/["']+/g, '');
		}

		this.alert = function(params) {

			if (params.alertType === undefined) {
				params.alertType = 'info';
			}

			if (params.duration === undefined) {
				params.duration = 10;
			}

			if (params.placement === undefined) {
				params.placement = 'bottom';
			}

			var alert = new $alert({
				title: params.title,
				content: params.content+"",
				alertType: params.alertType,
				duration: params.duration,
				placement: params.placement,
			});

			return alert;

		}

		this.merge = function(arr1, arr2, prop) {
			_.each(arr2,function(arr2obj) {
				var arr1obj = _.find(arr1,function(arr1obj){
					return arr1obj[prop] === arr2obj[prop];
				});
				arr1obj?_.extend(arr1obj,arr2obj):arr1.push(arr2obj);
			});
		}

		this.check_transitions = function(id_transition, transitions) {
			var check = _.findWhere(transitions, {id: id_transition});
			if (check === undefined) {
				return false;
			}
			return true;
		}

		this.print_stickers = function(batch_path, ids){
			var url =  config.bikaApiRest.plone_url.develop+batch_path+'/'+config.stickers.path+"&items="+ids.replace(/\|/g, ',');
			$window.open(url);
			//location.path(url);
		}



	}
);

