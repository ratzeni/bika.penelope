main_module.config(function($stateProvider, $urlRouterProvider, USER_ROLES) {
    $urlRouterProvider.otherwise('/login');

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'app/components/home/home.home.view.html',
            controller: 'HomeCtrl',
            data: {
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager, USER_ROLES.clerk, USER_ROLES.analyst]
            }
        })
        .state('batches', {
            url: '/batches',
            templateUrl: 'app/components/batches/batches.home.view.html',

            data: {
                 authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager, USER_ROLES.clerk, USER_ROLES.analyst]
            }

        })
        .state('batch', {
            url: '/batches/:batch_id',
            templateUrl: 'app/components/batches/batch.home.view.html',
           	controller: function($stateParams) {
				$stateParams.batch_id
			},
           	data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager, USER_ROLES.clerk, USER_ROLES.analyst]
            }


        })
        .state('samplesheet', {
            url: '/samplesheet/:batches/{content}',
            templateUrl: 'app/shared/attachment/samplesheet.view.html',
            controller: function($stateParams) {
				$stateParams.batches
				$stateParams.content
			},
            data: {
                 authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager, USER_ROLES.clerk, USER_ROLES.analyst]
            }

        })
        .state('analysis_requests', {
            url: '/analysis_requests/:review_state',
            templateUrl: 'app/components/analysis_requests/analysis_requests.home.view.html',
			controller: function($stateParams) {
				$stateParams.review_state
			},
            data: {
                 authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager, USER_ROLES.clerk, USER_ROLES.analyst]
            }

        })
        .state('analysis_request', {
            url: '/analysis_request/:analysis_request_id',
            templateUrl: 'app/components/analysis_requests/analysis_request.home.view.html',
			controller: function($stateParams) {
				$stateParams.analysis_request_id
			},
            data: {
                 authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager, USER_ROLES.clerk, USER_ROLES.analyst]
            }

        })
        .state('worksheets', {
            url: '/worksheets',
            templateUrl: 'app/components/worksheets/worksheets.home.view.html',
            data: {
                 authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager, USER_ROLES.clerk, USER_ROLES.analyst]
            }

        })
        .state('worksheet', {
            url: '/worksheet/:worksheet_id',
            templateUrl: 'app/components/worksheets/worksheet.home.view.html',
            data: {
                 authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager, USER_ROLES.clerk, USER_ROLES.analyst]
            }

        })
        .state('arimport', {
            url: '/arimport',
            templateUrl: 'app/components/arimport/arimport.home.view.html',
            data: {
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager, USER_ROLES.clerk, USER_ROLES.analyst]
            }

        })
        .state('cost_centers', {
            url: '/cost_centers',
            templateUrl: 'app/components/admin/cost_centers/cost_centers.home.view.html',
            data: {
                authorizedRoles: [USER_ROLES.admin]
            }

        })
        .state('cost_center', {
            url: '/cost_center/:costcenter_id',
            templateUrl: 'app/components/admin/cost_centers/cost_center.home.view.html',
            data: {
                authorizedRoles: [USER_ROLES.admin]
            }

        })
        .state('blackboard', {
            url: '/blackboard',
            templateUrl: 'app/components/blackboard/blackboard.home.view.html',
            data: {
                 authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager, USER_ROLES.clerk, USER_ROLES.analyst]
            }
        })
        .state('export_results', {
            url: '/nglimstools/export_results',
            templateUrl: 'app/components/nglimstools/export_results.view.html',
            controller: 'ExportResultsCtrl',
            data: {
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.manager, USER_ROLES.clerk, USER_ROLES.analyst]
            }

        })
        .state('login', {
            url: '/login',
            templateUrl: 'app/shared/login/login.view.html',
            controller: 'LoginCtrl',
        })
});
