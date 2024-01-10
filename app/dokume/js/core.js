'use strict';

var localBackend = null;
var backendSource = null;
var socket = null;
var auth = null;

var SERVER_URL = DM_CORE_CONFIG.BACKEND_URL + '/';
var DM_CONFIG = null;

var DM_CORE = (function () {

  var IS_INIT_ROUTES = false;

  init();

  function init() {

    if (DM_CORE_CONFIG.SUBDOMAIN_WHITELABEL === true) {
      DM_WHITELABEL.init(subdomain);
    }

    // reject browser plugin
    $.reject();

    if (typeof DM_CORE_CONFIG === 'undefined') {
      console.warn('DM_CORE_CONFIG is not loaded.');
      elq('#dmLoadingDIV h3').innerHTML = 'DM_CORE_CONFIG is not loaded.';
      return false;
    }

    if (DM_CORE_CONFIG.AUTH_MODE !== 'public') {
      auth = new DokuMe_Auth(SERVER_URL);
    }

    if (SERVER_TYPE === 'local') {
      localBackend = new DokuMe_LocalBackend();
    }
    backendSource =  localBackend ;
    initErrorLogging();

    bindEvents();

  }

  function start() {
    if (DM_CORE_CONFIG.AUTH_MODE === 'private') {
      authCheck();
    } else if (DM_CORE_CONFIG.AUTH_MODE === 'landing' && DM_CORE_CONFIG.LANDING_URL) {
      window.location = DM_CORE_CONFIG.LANDING_URL;
      initRoutes();
    } else if (DM_CORE_CONFIG.AUTH_MODE === 'public' && DM_CORE_CONFIG.LANDING_URL) {
      //window.location = DM_CORE_CONFIG.LANDING_URL;
      initRoutes();
      el('dmLoadingDIV').style.display = 'none';
    } else if (DM_CORE_CONFIG.AUTH_MODE === 'mix' && DM_CORE_CONFIG.LANDING_URL) {
      authCheck();
      //window.location = DM_CORE_CONFIG.LANDING_URL;
    } else {
      initRoutes();
      el('dmLoadingDIV').style.display = 'none';
    }
  }

  function initRoutes() {
    if (IS_INIT_ROUTES) {
      // console.log('bin hier raus');
      return false;
    }

    if (typeof cordova !== 'undefined') {
      document.addEventListener('deviceready', function () {
        //DM_ROUTING.routingAuthCheck();
        DM_ROUTING.init();
        hasher.init();
      });
    } else {
      //DM_ROUTING.routingAuthCheck();
      DM_ROUTING.init();
      hasher.init();
    }

    IS_INIT_ROUTES = true;
  }

  function bindEvents() {
    initLocalStorageSyncListener();
  }

  function initErrorLogging() {

    if (subdomain !== 'dokume') return false;

    Sentry.init({
      dsn: 'https://b1dc4d05ddd7477298c9c2c28c19bc57@sentry.io/200154',
      debug: true,
      //maxBreadcrumbs: 50,
    });

    Sentry.configureScope(function (scope) {
      scope.setUser({
        "id": auth.config.id,
        "username": auth.config.user
        //"email": "john.doe@example.com",
      });
    });

  }

  function logout(callback) {

    elq('#dmLoadingDIV h3').innerHTML ='You will be logged out.';
    el('dmLoadingDIV').style.display = 'flex';

    auth.logout(function () {
      localStorage.clear();
      if (callback) {
        callback();
      } else if (DM_CORE_CONFIG.LOGOUT_CALLBACK) {
        DM_CORE_CONFIG.LOGOUT_CALLBACK(function () {
          initRoutes();
          authCheckSuccess(data.MESSAGE);
        });
      } else if (DM_CORE_CONFIG.DOKUME_PLATFORM !== 'app') {
        start();
      } else {
        start();
      }

    });

  }

  function authCheck() {
    if (typeof auth === 'undefined') return false;

    if (!auth || !auth.config || auth.config.token === '' || auth.config.token === null) {
      auth.loggedIn = false;
      loginCheck();
      return false;
    }
    console.log(auth)
    backendSource.customRequest('auth', null, {
      token: auth.config.token,
      grant_type: 'check'
    }, function (data) {
      console.log(data)
      el('dmLoadingDIV').style.display = 'none';

      if (data.SUCCESS !== true) {
        auth.loggedIn = false;
        loginCheck();
        return false;
      }

      auth.loggedIn = true;
      auth.config.id = data.MESSAGE.id;
      auth.config.user = data.MESSAGE.name;

      DM_CONFIG = data.MESSAGE;

      let config = {
        token: data.MESSAGE.access_token,
        refresh: data.MESSAGE.access_token,
        id: data.MESSAGE.id,
        type: data.MESSAGE.type,
        ph: data.MESSAGE.ph,
        status: data.MESSAGE.status,
        user: encodeURIComponent(data.MESSAGE.name)
      };

      localStorage.setItem('authConfig', btoa(JSON.stringify(config)));

      checkAccountStatus();

      //socket
      if (DM_CORE_CONFIG.WEBSOCKET) {
        if (typeof (socket) !== 'undefined' && socket && socket.ws) {
          socket.ws.refresh();
        } else {
          socket = new DokuMe_Socket(DM_CORE_CONFIG.WEBSOCKET);
        }
      }

      DM_TEMPLATE.setDesign(DM_CONFIG.DESIGN);

      if (DM_CONFIG.WHITELABEL) {
        DM_WHITELABEL.init(DM_CONFIG.WHITELABEL);
      }

      if (DM_CORE_CONFIG.LOGIN_CALLBACK) {
        DM_CORE_CONFIG.LOGIN_CALLBACK(function () {
          initRoutes();
          authCheckSuccess(data.MESSAGE);
        });
      } else {
        initRoutes();
        authCheckSuccess(data.MESSAGE);
      }
    });

  }

  function authCheckSuccess(data) {

    // turn off app lock so all pages are available
    DM_ROUTING.toggleAppLock(false);

    var doRedirect = true;

    if (data.WORKFLOW_STATE === 'pendingAgeCheck' || data.WORKFLOW_STATE === 'pendingParentConfirmation' || data.WORKFLOW_STATE === 'locked') {
      window.location = '#/onboarding/age_check';

      doRedirect = false;

    } else if (data.WORKFLOW_STATE === 'willBeDeleted') {
      window.location = '#/onboarding/delete_account';

      doRedirect = false;

    } else if (data.DATA_ACTION_NEEDED == 3) {
      get_param3 = window.location.hash;

      window.location = '#/userdata/index/3';

      doRedirect = false;

    } else if (data.WORKFLOW_STATE === 'passwordSet') {
      if (DM_CORE_CONFIG.VERIFY_EMAIL && DM_CORE_CONFIG.VERIFY_EMAIL === true) {
        window.location = '#/onboarding/confirm';

        doRedirect = false;
      }

    }

    if (doRedirect) {

      if (page_name === 'login' && get_param1) {

        var redirect = '';

        try {
          redirect = atob(get_param1);
        } catch (e) {
          window.location = DM_CORE_CONFIG.AUTH_SUCCESS_URL;
        }

        if (redirect.includes('#')) {
          window.location = redirect;
        }

      } else if (data.STARTPAGE && data.STARTPAGE !== '' && data.STARTPAGE !== page_name) {

        if (window.location.hash === '#/login' || window.location.hash === '' || window.location.hash === '#' || window.location.hash === '#/') {
          window.location = '#/' + data.STARTPAGE;
        }

      } else if (page_name === 'login' || page_name === 'signup') {

        if (page_name === 'signup' && get_param1) {
          window.location = '#/subscription/choose/' + get_param1;
        } else {
          window.location = DM_CORE_CONFIG.AUTH_SUCCESS_URL;
        }

      } else {

        // redirect only if no path available
        if (window.location.hash === '' || window.location.hash === '#' || window.location.hash === '#/') {
          hasher.setHash(DM_CORE_CONFIG.AUTH_SUCCESS_URL.replace('#/', ''));
          window.location = DM_CORE_CONFIG.AUTH_SUCCESS_URL;
        }

      }

    }

    el('dmLoadingDIV').style.display = 'none';

    if (DM_CORE_CONFIG.DOKUME_PLATFORM === 'app') {
      DM_MOBILE_PUSHNOTIFICATION.init();
    } 
  }

  function loginCheck(forceLogin, callback) {

    if (DM_CORE_CONFIG.AUTH_MODE === 'private' || forceLogin === true) {
      initRoutes();
      /*************/

      if (auth.loggedIn === 'isLoggingIn') {
        return false;
      } else if (auth.loggedIn === 'isLoginPage') {
        if (!window.location.href.includes('login')) {
          window.location = '#/login/index/' + btoa(window.location.hash.replace('/login/index/', ''));
        }

        el('dmLoadingDIV').style.display = 'none';

        return false;
      }

      auth.loggedIn = 'isLoggingIn';

      if ((typeof page_name !== 'undefined' && (page_name === 'login' || page_name === 'signup')) || (typeof app_name !== 'undefined' && app_name === 'realestate_signup') || window.location.hash.includes('login')) {
        auth.loggedIn = false;

        el('dmLoadingDIV').style.display = 'none';

        return false;

      } else if (auth.config.refresh && auth.config.refresh !== null) {
        auth.refresh_token(function (data) {
          if (data === false) {

            auth.loggedIn = false;

            if (page_name !== 'login' || page_name !== 'signup') {
              window.location = '#/login/index/' + btoa(window.location.hash.replace('/login/index/', ''));
            }

            return false;
          }

          if (page_name === 'login' || page_name === 'signup' || !page_name || page_name === '') {

            page_name = null;

            if (window.location.hash === '' || window.location.hash === DM_CORE_CONFIG.AUTH_SUCCESS_URL) {
              console.log('gehe zu success url');
              window.location = DM_CORE_CONFIG.AUTH_SUCCESS_URL;
            } else {
              window.location = window.location.href;
            }
          } 

          if (typeof callback === 'function') {
            callback(auth.config.token);
          }
        });

      } else {

        // no refresh token available
        auth.loggedIn = false;

        if (window.location.hash.indexOf('signup') > -1) {
          window.location = '#/login/signup';

          if (typeof hasher !== 'undefined') {
            hasher.setHash('login/signup')
          }

        } else if (window.location.hash === '' || window.location.hash === '#' || window.location.hash === '#/' || window.location.hash === DM_CORE_CONFIG.AUTH_SUCCESS_URL || (window.location.hash.indexOf('login') > -1 && window.location.hash.indexOf('index') < 0)) {

          window.location = '#/login';

          if (typeof hasher !== 'undefined') {
            hasher.setHash('login');
          }
        } else {

          var redirect = '#/login/index/' + btoa(window.location.hash.replace('/login/index/', ''));

          window.location = redirect;

          if (typeof hasher !== 'undefined') {
            //hasher.setHash(redirect)
          }
        }
      }
      /* else if (page_name !== 'onboarding') {console.log('he');
        window.location = '#/login';
        $('#mainContent').load('APPS/login/index.html');
      }*/



      /*************/



    }

    el('dmLoadingDIV').style.display = 'none';
  }

  function checkAccountStatus() {

    if (DM_CONFIG && DM_CONFIG.USER_TOUR_DONE) {
      

      var installRoutine = DM_CONFIG.USER_TOUR_DONE.find(a => a.ONBOARDING_TYPE == 1 && a.DONE == 0);
      if (installRoutine) {// && subdomain == 'my') {
        window.location = `#/onboarding/start/${installRoutine.ONBOARDING_TYPE}/${installRoutine.ID}`;
      }

    }
  }


  function initLocalStorageSyncListener() {
    window.addEventListener('storage', function (event) {
      if (event.key !== 'authConfig') return false;

      var stop = false;

      var authConfig = event.newValue;

      if (!authConfig || authConfig == 'null') {
        return false;
      }

      try {
        authConfig = JSON.parse(atob(authConfig));
      } catch (e) {

        try {
          authConfig = JSON.parse(authConfig);
        } catch (e2) {
          stop = true;
          console.warn(authConfig);
        }
      }

      if (stop) return false;

      auth.config = {
        token: (authConfig && authConfig.token) ? authConfig.token : null,
        refresh: (authConfig && authConfig.refresh) ? authConfig.refresh : null,
        id: (authConfig && authConfig.id) ? authConfig.id : null,
        type: (authConfig && authConfig.type) ? authConfig.type : null,
        ph: (authConfig && authConfig.ph) ? authConfig.ph : null,
        status: (authConfig && authConfig.status) ? authConfig.status : null,
        user: (authConfig && authConfig.user) ? authConfig.user : null
      };

      localStorage.setItem('authConfig', event.newValue);

    });
  }

  return {
    start,
    authCheck,
    loginCheck,
    logout
  };

})();
