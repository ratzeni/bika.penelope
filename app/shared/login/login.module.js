var login_module = angular.module('LoginModule',[]);

login_module.constant('USER_ROLES', {
	all : '*',
	user : 'user',
}).constant('AUTH_EVENTS', {
	loginSuccess : 'auth-login-success',
	loginFailed : 'auth-login-failed',
	logoutSuccess : 'auth-logout-success',
	sessionTimeout : 'auth-session-timeout',
	notAuthenticated : 'auth-not-authenticated',
	notAuthorized : 'auth-not-authorized'
});

/* Adding the auth interceptor here, to check every $http request*/
/* Adding the auth interceptor here, to check every $http request*/
login_module.config(
	function ($httpProvider) {
	  $httpProvider.interceptors.push([
		'$injector',
		function ($injector) {
		  return $injector.get('AuthInterceptor');
		}
	  ]);
	}
);

login_module.service('Session',
	function($rootScope, USER_ROLES) {

		this.create = function(user) {
			this.user = user;
			this.userRole = user.userRole;
		};
		this.destroy = function() {
			this.user = null;
			this.userRole = null;
		};
		return this;
	}
);

login_module.factory('AuthInterceptor', function($rootScope, $q, Session, AUTH_EVENTS) {
	return {
		responseError : function(response) {
			$rootScope.$broadcast({
				401 : AUTH_EVENTS.notAuthenticated,
				403 : AUTH_EVENTS.notAuthorized,
				419 : AUTH_EVENTS.sessionTimeout,
				440 : AUTH_EVENTS.sessionTimeout
			}[response.status], response);
			return $q.reject(response);
		}
	};
});

login_module.factory('Auth',
	function(BikaService, Utility, $http, $state, $rootScope, $window, Session, AUTH_EVENTS) {
		var authService = {};
		//the login function
		authService.login = function(user, success, error) {
			BikaService.login(user).success(function (data, status, header, config){
        		is_signed = (data.result.toLowerCase() == 'true');
        		if (is_signed) {
        			user.userRole = 'user';
        			//set the browser session, to avoid relogin on refresh
					$window.sessionStorage["userInfo"] = JSON.stringify(user);
					//update current user into the Session service or $rootScope.currentUser
					Session.create(user);
					$rootScope.currentUser = user;
					//fire event of successful login
					$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
					//run success function
					success(user);

				}
				else {
					//OR ELSE
					//unsuccessful login, fire login failed event for
					//the according functions to run
					$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
					error();
				}

    		})
    		.error(function() {
    			console.log('errore');

    		});

		};

		//check if the user is authenticated
		authService.isAuthenticated = function() {
			return !!Session.user;
		};

		//check if the user is authorized to access the next route
		//this function can be also used on element level
		//e.g. <p ng-if="isAuthorized(authorizedRoles)">show this only to admins</p>
		authService.isAuthorized = function(authorizedRoles) {
			if (!angular.isArray(authorizedRoles)) {
			  authorizedRoles = [authorizedRoles];
			}
			return (authService.isAuthenticated() &&
			  authorizedRoles.indexOf(Session.userRole) !== -1);
		};

		//log out the user and broadcast the logoutSuccess event
		authService.loading = Utility.loading({busyText: 'Logout...', theme: 'danger', showBar: false, delayHide: 500});
		authService.logout = function(){
			authService.loading.show();
			Session.destroy();
			$window.sessionStorage.removeItem("userInfo");
			$state.go('login');
			$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
			authService.loading.hide();
		}
		return authService;
	}
);

// :: LOGIN CONTROLLER ::
login_module.controller('LoginCtrl',
function(Utility, $scope, $rootScope, $state, $window, $timeout, Auth ) {

	var self = this;
	self.credentials = {username: '', password: ''};

	$scope.$state = $state;
	$scope.loginForm = {};
	$scope.error = false;
	$scope.loading = Utility.loading({busyText: 'Login...', theme: 'success', showBar: false, delayHide: 100});

	//Performs the login function, by sending a request to the server with the Auth service
	self.login = login;
	function login(credentials) {
		$scope.error = false;
		Auth.login(credentials, function(user) {
			$state.go('batches');
		}, function(err) {
			console.log('error function');
			$scope.error = true;
		});
	};

	//when the form is submitted
	self.submit = submit;
	function submit() {
		$scope.loading.show();
		$scope.submitted = true;
		if (!$scope.loginForm.$invalid) {
			self.login(self.credentials);
		} else {
			$scope.error = true;
			return;
		}
		$scope.loading.hide();
	};

	// if a session exists for current user (page was refreshed)
	// log him in again
	if ($window.sessionStorage["userInfo"]) {
		var credentials = JSON.parse($window.sessionStorage["userInfo"]);
		self.login(credentials);
	}

} );
