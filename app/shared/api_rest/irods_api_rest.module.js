var irods_api_rest_module = angular.module('IrodsApiRestModule', [])

irods_api_rest_module.run(function($rootScope){
  $rootScope._ = _;
});

irods_api_rest_module.service('IrodsApiRestService',  function(init, $http) {

    this.call = function(method, params) {

		this.conf = init.apiRest;
        this.url = this.conf.url + method + '?callback' + '=' +  this.conf['callback'];

        for (var key in params) {
           this.url+= '&' + key + '=' +  params[key];
        }

        return $http.jsonp(this.url);
    }
});

irods_api_rest_module.service('IrodsService', function(IrodsApiRestService, init, config, $http) {

	this.getRunningFolders = function(params) {

		this.params = (params !== undefined)?params:{}
        _.extend(this.params,init.sshApiRest);

    	this.method = config.irodsApiRest.methods.get_running_folders;
        return IrodsApiRestService.call(this.method, this.params);
    }

    this.putSamplesheet = function(params) {

		this.params = (params !== undefined)?params:{}
        _.extend(this.params,init.sshApiRest);
        _.extend(params,init.irodsApiRest);

    	this.method = config.irodsApiRest.methods.put_samplesheet;
        return IrodsApiRestService.call(this.method, this.params);
    }

});