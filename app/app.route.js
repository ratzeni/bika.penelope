main_module.config(function($stateProvider, $urlRouterProvider, USER_ROLES) {
    $urlRouterProvider.otherwise('/login');

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'app/components/home/home.view.html',
            controller: 'HomeCtrl',
            data: {
                authorizedRoles: [USER_ROLES.user]
            }

        })
        .state('analysis_requests', {
            url: '/analysis_requests',
            templateUrl: 'app/components/analysis_requests/analysis_requests.home.view.html',

            data: {
                authorizedRoles: [USER_ROLES.user]
            }

        })
        .state('analysis_request', {
            url: '/analysis_requests/:analysis_request_id',
            templateUrl: 'app/components/analysis_requests/analysis_request.home.view.html',
			controller: function($stateParams) {
				$stateParams.analysis_request_id
			},
            data: {
                authorizedRoles: [USER_ROLES.user]
            }

        })
        .state('batches', {
            url: '/batches',
            templateUrl: 'app/components/batches/batches.home.view.html',

            data: {
                authorizedRoles: [USER_ROLES.user]
            }

        })
        .state('batch', {
            url: '/batches/:batch_id',
            templateUrl: 'app/components/batches/batch.home.view.html',
           	controller: function($stateParams) {
				$stateParams.batch_id
			},
           	data: {
                authorizedRoles: [USER_ROLES.user]
            }


        })
        .state('arimport', {
            url: '/arimport',
            templateUrl: 'app/components/arimport/arimport.home.view.html',

            data: {
                authorizedRoles: [USER_ROLES.user]
            }

        })
        .state('worksheet', {
            url: '/worksheet',
            templateUrl: 'app/components/worksheet/worksheet.home.view.html',

            data: {
                authorizedRoles: [USER_ROLES.user]
            }

        })
        .state('samplesheet', {
            url: '/nglimstools/samplesheet',
            templateUrl: 'app/components/nglimstools/samplesheet.view.html',
            controller: 'SamplesheetCtrl',
            data: {
                authorizedRoles: [USER_ROLES.user]
            }

        })
        .state('export_results', {
            url: '/nglimstools/export_results',
            templateUrl: 'app/components/nglimstools/export_results.view.html',
            controller: 'ExportResultsCtrl',
            data: {
                authorizedRoles: [USER_ROLES.user]
            }

        })
        .state('login', {
            url: '/login',
            templateUrl: 'app/shared/login/login.view.html',
            controller: 'LoginCtrl',
        })
});
