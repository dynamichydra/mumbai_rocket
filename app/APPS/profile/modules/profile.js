'use strict';

(function () {
  
  init();

  function init() {
    $('#pageTitle').html('Dashboard');
    DM_COMMON.userProfileBlock(true);
    bindEvents();
  }

  function bindEvents() {
    $('.statement').on('click',function(){
      window.location = '#/wallet/statement';
    });
    $('.security').on('click',function(){
      window.location = '#/profile/changepwd';
    });
    $('.profileMenu .about').on('click',function(){
      window.location = '#/page/about';
    });
    $('.profileMenu .tutorial').on('click',function(){
      window.location = '#/page/beginners';
    });
    $('.profileMenu .service').on('click',function(){
      window.location = '#/page/service';
    });
    el('logoutBTN').addEventListener('click', function (e) {
      e.preventDefault();
      DM_CORE.logout();
    });
  }


})();