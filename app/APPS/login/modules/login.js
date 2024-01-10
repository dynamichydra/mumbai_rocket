'use strict';

(function () {

  let passwordVisible = false;

  init();

  function init() {

    localStorage.clear();
    showWhiteLabel();
    if(auth){
      auth.loggedIn = 'isLoginPage';
    }

    page_name = 'login';

    bindEvents();

    el('dmLoadingDIV').style.display = 'none';
  }

  function showWhiteLabel() {
    el('loginLogo').src = elq('.navbar-brand img').src;
  }

  function bindEvents() {
    el('loginForm').addEventListener('submit', login);

    el('showPassword').addEventListener('click', function () {
      if (!passwordVisible) {
        el('pass').type = 'text';
        passwordVisible = true;
        el('showPassword').innerHTML = '<i class="bi bi-eye-slash"></i>';
      } else {
        el('pass').type = 'password';
        passwordVisible = false;
        el('showPassword').innerHTML = '<i class="bi bi-eye"></i>';
      }
    });

    el('cancleBTN').addEventListener('click', function () {
      if (typeof DM_CORE_CONFIG !== 'undefined' && DM_CORE_CONFIG.LANDING_URL) {
        window.location = DM_CORE_CONFIG.LANDING_URL;
      }
    });

    // el('shareOne').addEventListener('click', async function () {
    //   const sharedData = {
    //     title: "Mumbai Rocket",
    //     text: "Play for fun!!",
    //     url: "https://www.mumbairockets.com/",
    //   };
    //   try {
    //     alert('in')
    //     let a = await navigator.share(sharedData);
    //   } catch (e) {
    //     alert('Can not share')
    //     console.error(`Error: ${e}`);
    //   }
    // });
    // el('shareTwo').addEventListener('click', async function () {
    //   let urlToShare = 'https://www.mumbairockets.com/';
    // // let whatsappLink = 'whatsapp://send?text=' + encodeURIComponent(urlToShare);
    // // window.location.href = whatsappLink;
    // window.open(`https://wa.me/?text=${encodeURIComponent(urlToShare)}`, '_system');
    // });
    // el('shareThree').addEventListener('click', async function () {
    //   let urlToShare = 'https://www.mumbairockets.com/';
    //   let whatsappLink = 'whatsapp://send?text=' + encodeURIComponent(urlToShare);
    //   window.location.href = whatsappLink;
    // // window.open(`https://wa.me/?text=${encodeURIComponent(urlToShare)}`, '_system');
    // });
    // el('shareFour').addEventListener('click', async function () {
    //   let phoneNumber = '+918240058103';
    //   let whatsappLink = 'whatsapp://send?phone=' + phoneNumber;
    //   window.location.href = whatsappLink;
    // });

  }

  function login(e) {
    e.preventDefault();

    var btn = elq('.loginDIV #loginBTN');
    btn.disabled = true;
    btn.insertAdjacentHTML('afterbegin', '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>');
    
    auth.login(el('phone').value, el('pass').value, function (data) {

      btn.getElementsByClassName('spinner-border')[0].remove();
      btn.disabled = false;

      if (!data.access_token) {

        el('errorMsg').style.display = 'block';
        el('loginDIV').classList.add('shake');
        el('loginDIV').addEventListener('animationend', function () {
          el('loginDIV').classList.remove('shake');
        });

        return false;
      }

      auth.loggedIn = true;

      if (typeof DM_CORE !== 'undefined') {
        DM_CORE.authCheck();
      }

    });
  }
})();
