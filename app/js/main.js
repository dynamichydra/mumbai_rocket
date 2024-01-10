'use strict';

var DM_MAIN = (function () {

  init();

  function init() {

    var isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (!isMobile) {
      window.location = 'mobilePreview.html';
      return false;
    }

    DM_TEMPLATE.init();

    DM_CORE_CONFIG.LOGIN_CALLBACK = login;
    DM_CORE_CONFIG.LOGOUT_CALLBACK = logout;

    elq('.navbar-brand').href = DM_CORE_CONFIG.LANDING_URL;
    elq('.navbar-brand-sm').href = DM_CORE_CONFIG.LANDING_URL;

    initDatabase();

    bindEvents();

    DM_CORE.start();
  }

  function bindEvents() {
    el('toggleAppMenu').addEventListener('click', function () {
      el('appMenu').classList.toggle('visible');
    });

    el('goBackBTN').addEventListener('click', function () {
      if(app_name ==  'game' && page_name == 'mumbaiRocket'){
        if($("#gamePlay").css("display") == 'block'){
          $("#gamePlay").css("display",'none'); 
          $("#gameType").css("display",'block'); 
        }else if($("#gameType").css("display") == 'block'){
          $("#gameList").css("display",'block'); 
          $("#gameType").css("display",'none'); 
        }else{
          history.back();
        }
      }else{
        history.back();
      }
    })
  }

  function login(callback) {
    el('loginBTN').style.display = 'none';
    el('logoutBTN').style.display = 'block';
    $('.loggedInOnly').show();
    
    if (DM_CONFIG.STARTPAGE) {
      elq('.navbar-brand').href = '#/' + DM_CONFIG.STARTPAGE;
      elq('.navbar-brand-sm').href = '#/' + DM_CONFIG.STARTPAGE;
    }

    if (typeof callback === 'function') {
      callback();
    }
  }

  function logout() {

    el('logoutBTN').style.display = 'none';
    $('.loggedInOnly').hide();
    el('loginBTN').style.display = 'block';
    
    if (DM_CORE_CONFIG.AUTH_MODE === 'private') {
      window.location = '#/login';
    } else if (window.location.hash === DM_CORE_CONFIG.LANDING_URL) {
      location.reload();
    } else {
      window.location = DM_CORE_CONFIG.LANDING_URL;
    }
  }

  async function initDatabase() {
    const databaseName = 'PushApp';
    const databaseVersion = 2;


    const objectStoreConfigs = [{
      storeName: 'pinned_messages',
      keyPath: 'ID',
      indexes: null
    }, {
      storeName: 'messages',
      keyPath: 'ID',
      indexes: null
    }, {
      storeName: 'notification',
      keyPath: 'ID',
      indexes: null
    }, {
      storeName: 'menu',
      keyPath: 'ID',
      indexes: null
    }, {
      storeName: 'content',
      keyPath: 'ID',
      indexes: null
    }, {
      storeName: 'categories',
      keyPath: 'ID',
      indexes: null
    }, {
      storeName: 'subscription',
      keyPath: 'ID',
      indexes: null
    }
    ];

    INDEXDB = new IndexedDBWrapper(databaseName, databaseVersion);

    INDEXDB.openDatabase(objectStoreConfigs)
      .then(() => {
        // Database opened with dynamic object store creation
        // ... perform other operations ...
      })
      .catch((error) => {
        console.error('An error occurred:', error);
      })
      .finally(() => {
        //dbWrapper.closeDatabase();
      });
  }


  return {
    logout
  }

})();

var systemNotification = null;

function showSystemNotification(type, text, callback) {
  if (systemNotification) {
    clearTimeout(systemNotification);
  }

  text = decodeURIComponent(text);
  text = text.replace(/<[^>]+>/g, '');

  if (type === 3) {
    //showStaticNotification(type, text, callback);
    return false;
  }

}

function showToastNotification(type, text, callback) {
  console.log('turn off');
}

util.setShowFeedback(showToastNotification);
