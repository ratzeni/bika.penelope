var bika_api_rest_module = angular.module('BikaApiRestModule', [])

bika_api_rest_module.service('BikaApiRestService',  function(config, $http, $rootScope) {
    this.conf = config.bikaApiRest.develop;


    this.call = function(method, params) {

        if (params === undefined) {
            var params = {}
        }

        if ($rootScope.currentUser  !== undefined) {
            params.username = $rootScope.currentUser.username;
            params.password = $rootScope.currentUser.password;
        }

        this.url = this.conf.rest_url + method + '?';
        for (var key in this.conf) {
            if (key != 'rest_url') {
                this.url+= '&' + key + '=' +  this.conf[key];
            }
        }

        for (var key in params) {
            if (key == 'username') {
                this.url+= '&' + 'bika_user' + '=' +  params[key];
            }
            else if (key == 'password') {
                this.url+= '&' + 'bika_passwd' + '=' +  params[key];
            }
            else {
                this.url+= '&' + key + '=' +  params[key];
            }
        }

        return $http.jsonp(this.url);
    }
});


bika_api_rest_module.service('BikaService', function(BikaApiRestService, config, $http) {

    this.login = function(params) {
        method = config.bikaApiRest.methods.login;
        return BikaApiRestService.call(method, params);
    }

	this.checkStatus = function() {
        method = config.bikaApiRest.methods.check_status;
        return BikaApiRestService.call(method);
    };

    this.getClients = function(params) {
        method = config.bikaApiRest.methods.get_clients;
        return BikaApiRestService.call(method, params);
    };

    this.getContacts = function(params) {
        method = config.bikaApiRest.methods.get_contacts;
        return BikaApiRestService.call(method, params);
    };

	this.getSamples = function(params) {
        method = config.bikaApiRest.methods.get_samples;
        return BikaApiRestService.call(method, params);
    };

    this.countSamples = function(params) {
        method = config.bikaApiRest.methods.count_samples;
        return BikaApiRestService.call(method, params);
    };

    this.getAnalysisServices = function() {
        method = config.bikaApiRest.methods.get_analysis_services;
        return BikaApiRestService.call(method);
    };

    this.getAnalysisProfiles = function() {
        method = config.bikaApiRest.methods.get_analysis_profiles;
        return BikaApiRestService.call(method);
    };

    this.getSampleTypes = function(params) {
        method = config.bikaApiRest.methods.get_sample_types;
        return BikaApiRestService.call(method, params);
    };

    this.getBatches = function(params) {
        method = config.bikaApiRest.methods.get_batches;
        return BikaApiRestService.call(method, params);
    };

    this.getWorksheets = function(params) {
        method = config.bikaApiRest.methods.get_worksheets;
        return BikaApiRestService.call(method, params);
    };

    this.getUsers = function(params) {
        method = config.bikaApiRest.methods.get_users;
        return BikaApiRestService.call(method, params);
    };

    this.getManagerUsers = function(params) {
        method = config.bikaApiRest.methods.get_manager_users;
        return BikaApiRestService.call(method);
    };

    this.getAnalystUsers = function() {
        method = config.bikaApiRest.methods.get_analyst_users;
        return BikaApiRestService.call(method);
    };

    this.getClerkUsers = function() {
        method = config.bikaApiRest.methods.get_clerk_users;
        return BikaApiRestService.call(method);
    };

    this.getClientUsers = function() {
        method = config.bikaApiRest.methods.get_client_users;
        return BikaApiRestService.call();
    };

	this.getAnalysisRequests = function(params) {
        method = config.bikaApiRest.methods.get_analysis_requests;
        return BikaApiRestService.call(method, params);
    };

    this.countAnalysisRequests = function(params) {
        method = config.bikaApiRest.methods.count_analysis_requests;
        return BikaApiRestService.call(method, params);
    };

	this.createWorksheet = function(params) {
    	method = config.bikaApiRest.methods.create_worksheet;
        return BikaApiRestService.call(method, params);
    }

    this.updateWorksheet = function(params) {
    	method = config.bikaApiRest.methods.update_worksheet;
        return BikaApiRestService.call(method, params);
    }

    this.createBatch = function(params) {
    	method = config.bikaApiRest.methods.create_batch;
        return BikaApiRestService.call(method, params);
    }

	this.createAnalysisRequest = function(params) {
    	method = config.bikaApiRest.methods.create_analysis_request;
        return BikaApiRestService.call(method, params);
    }

    this.cancelBatch = function(params) {
    	method = config.bikaApiRest.methods.cancel_batch;
        return BikaApiRestService.call(method, params);
    }

    this.cancelWorksheet = function(params) {
    	method = config.bikaApiRest.methods.cancel_worksheet;
        return BikaApiRestService.call(method, params);
    }

    this.cancelAnalysisRequest = function(params) {
    	method = config.bikaApiRest.methods.cancel_analysis_request;
        return BikaApiRestService.call(method, params);
    }

    this.reinstateBatch = function(params) {
    	method = config.bikaApiRest.methods.reinstate_batch;
        return BikaApiRestService.call(method, params);
    }

	this.reinstateWorksheet = function(params) {
    	method = config.bikaApiRest.methods.reinstate_worksheet;
        return BikaApiRestService.call(method, params);
    }

    this.reinstateAnalysisRequest = function(params) {
    	method = config.bikaApiRest.methods.reinstate_analysis_request;
        return BikaApiRestService.call(method, params);
    }

    this.openBatch = function(params) {
    	method = config.bikaApiRest.methods.open_batch;
        return BikaApiRestService.call(method, params);
    }

    this.closeBatch = function(params) {
    	method = config.bikaApiRest.methods.close_batch;
        return BikaApiRestService.call(method, params);
    }

    this.openWorksheet = function(params) {
    	method = config.bikaApiRest.methods.open_worksheet;
        return BikaApiRestService.call(method, params);
    }

    this.closeWorksheet = function(params) {
    	method = config.bikaApiRest.methods.close_worksheet;
        return BikaApiRestService.call(method, params);
    }

    this.receiveSample = function(params) {
    	method = config.bikaApiRest.methods.receive_sample;
        return BikaApiRestService.call(method, params);
    }

    this.submit = function(params) {
    	method = config.bikaApiRest.methods.submit;
        return BikaApiRestService.call(method, params);
    }

    this.assign = function(params) {
    	method = config.bikaApiRest.methods.assign;
        return BikaApiRestService.call(method, params);
    }

    this.verify = function(params) {
    	method = config.bikaApiRest.methods.verify;
        return BikaApiRestService.call(method, params);
    }

    this.publish = function(params) {
    	method = config.bikaApiRest.methods.publish;
        return BikaApiRestService.call(method, params);
    }

    this.setAnalysisResult = function(params) {
    	method = config.bikaApiRest.methods.set_analysis_result;
        return BikaApiRestService.call(method, params);
    }

    this.setAnalysesResults = function(params) {
    	method = config.bikaApiRest.methods.set_analyses_results;
        return BikaApiRestService.call(method, params);
    }
});