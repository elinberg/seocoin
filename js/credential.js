// TODO(DEVELOPER): Change the values below using values from the initialization snippet: Firebase Console > Overview > Add Firebase to your web app.
// Initialize Firebase
var config = {
  apiKey: 'AIzaSyDq8ZDd8gxJilYloZEpi6cYAk31OCK2MC0',
  databaseURL: 'https://cryptotrade-e6228.firebaseio.com',
  storageBucket: 'cryptotrade-e6228.appspot.com'
};
firebase.initializeApp(config);
var postElement;
var defaultDatabase = firebase.database();
var recentPostsSection = document.getElementById('inbox');
var listeningFirebaseRefs = [];
/**
 * initApp handles setting up the Firebase context and registering
 * callbacks for the auth status.
 *
 * The core initialization is in firebase.App - this is the glue class
 * which stores configuration. We provide an app name here to allow
 * distinguishing multiple app instances.
 *
 * This method also registers a listener with firebase.auth().onAuthStateChanged.
 * This listener is called when the user is signed in or out, and that
 * is where we update the UI.
 *
 * When signed in, we also authenticate to the Firebase Realtime Database.
 */
function initApp() {

  // Listen for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      console.log(displayName);
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      // [START_EXCLUDE]
      document.getElementById('sign-in-button').textContent = 'Sign out';
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
      document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
      document.getElementById('email').textContent = email;
      document.getElementById('profilePic').setAttribute('src', photoURL);

      // [END_EXCLUDE]

      startDatabaseQueries();
    } else {
      // Let's try to get a Google auth token programmatically.
      // [START_EXCLUDE]

      console.log('!INIT');
      document.getElementById('sign-in-button').textContent = 'Sign-in with Google';
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
      document.getElementById('quickstart-account-details').textContent = 'null';
      // [END_EXCLUDE]
    }
    document.getElementById('sign-in-button').disabled = false;
  });
  // [END authstatelistener]

  document.getElementById('sign-in-button').addEventListener('click', startSignIn, false);
}

/**
 * Start the auth flow and authorizes to Firebase.
 * @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
 */
function startAuth(interactive) {
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({ interactive: !!interactive }, function (token) {
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.');
    } else if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      // Authrorize Firebase with the OAuth Access Token.
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInWithCredential(credential).catch(function (error) {
        // The OAuth token might have been invalidated. Lets' remove it from cache.
        firebase.auth().on('disconnect', function () {
          alert(firebase.database.ServerValue.TIMESTAMP);
        });
        if (error.code === 'auth/invalid-credential') {
          chrome.identity.removeCachedAuthToken({ token: token }, function () {
            startAuth(interactive);
          });
        }
      });
    } else {
      console.error('The OAuth Token was null');
    }
  });
}

/**
 * Starts the sign-in process.
 */
function startSignIn() {
  document.getElementById('sign-in-button').disabled = true;
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();

  } else {
    startAuth(true);
  }
}

function startDatabaseQueries() {

  console.log('Starting DB Queries');
  var myUserId = firebase.auth().currentUser.uid;
  var postsRef = firebase.database().ref('posts').limitToLast(100);

  var fetchPosts = function (postsRef, sectionElement) {
    postsRef.on('child_added', function (data) {
      var author = data.val().author || 'Anonymous';
      console.log(firebase.database.ServerValue.TIMESTAMP);

      var cookieId = readCookie('seocoin.id');

      sectionElement.appendChild(
        createListItem(data.key, data.val().title, data.val().keyword, author, data.val().uid, data.val().authorPic, data.val().destination_url, data.val().clickon, data.val().comment)
      );

      //this works
      //   var el = sectionElement.getElementsByClassName('link-' + data.key )[0];
      //   console.log('link-' + data.key);

      // el.addEventListener( 'click', function(e){

      //    console.log('hello');

      // } );

      check = document.querySelectorAll('.post-' + data.key + ' .mdl-checkbox')[0];
      var sidebarOverlay = document.getElementsByClassName('sidebar-overlay')[0];
      var sidebar = document.getElementById('sidebar');
      var sidebarToggle = document.getElementsByClassName('sidebar-toggle')[0];
      var inbox = document.getElementById('inbox');

      sidebarToggle.addEventListener('click', function (e) {

        inbox.className = inbox.className.replace(/\b hide\b/, '');
        //check.className = check.className.replace(/\b is-checked\b/, '');
        sidebar.className = sidebar.className.replace(/\b open\b/, '');

      });

      check.addEventListener('change', function (e) {

        if (this.className.indexOf('is-checked') !== -1) {

          this.className = this.className.replace(/\b is-checked\b/, '');
          createCookie('seocoin.id', '-1', 7);
          sidebar.className = sidebarOverlay.className.replace(/\b open\b/, '');
          inbox.className = inbox.className.replace(/\b hide\b/, '');

        } else {

          this.className = this.className.replace(/\b is-checked\b/, '');
          //this.className += " is-checked";
          createCookie('seocoin.id', data.key, 7);

          document.querySelector('#keywords').textContent = data.val().keyword;
          document.querySelector('#address').textContent = data.val().destination_url;

          sidebar.className = sidebar.className.replace(/\b open\b/, '') + ' open';
          inbox.className = inbox.className.replace(/\b hide\b/, '');
          inbox.className += ' hide';
        }
        console.log(readCookie('seocoin.id'));

      });

      if (cookieId == data.key) {
        check.dispatchEvent(new Event('change'));
        console.log('Found open post: ' + data.key);
      }

    });
    postsRef.on('child_changed', function (data) {
      //var containerElement = sectionElement.getElementById('title')[0];
      //postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
      // postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
      // postElement.getElementsByClassName('username')[0].innerText = data.val().author;
      // postElement.getElementsByClassName('text')[0].innerText = data.val().body;
      // postElement.getElementsByClassName('star-count')[0].innerText = data.val().starCount;
    });

    postsRef.on('child_removed', function (data) {
      console.log('Removing Child');
      var containerElement = sectionElement.getElementById('title');
      var post = containerElement.getElementsByClassName('post-' + data.key)[0];
      post.parentElement.removeChild(post);
    });
  };

  fetchPosts(postsRef, document.getElementById('inbox'));
  listeningFirebaseRefs.push(postsRef);

}



function addListElement(postElement, key, author, authorPic, email, lastVisitTime, title, typedCount, url, listContainer) {

  //   li.setAttribute("id", "element4"); // added line
  //   ul.appendChild(li);
  var listContainer = document.getElementById('inbox');


  listContainer.appendChild(postElement);

  console.log(listContainer);
}



function createListItem(postId, title, keyword, author, authorId, authorPic, destination_url, clickon, comment) {


  var html = '<li class="post-' + postId + ' mdc-list-item" data-mdc-auto-init="MDCRipple">' +
    '<span class="mdc-list-item__start-detail grey-bg" role="presentation">' +
    '<div class="avatar"></div>' +
    '<div class="username mdl-color-text--black"></div>' +
    '</span>' +
    '<span class="title mdc-list-item__text">' + title +
    '<span class="mdc-list-item__text__secondary">' + author + '</span>' +
    '</span>' +
    '<a href="#" class="mdc-list-item__end-detail material-icons actions link-' + postId + '" ' +
    'aria-label="View more information" title="More info" ' +
    '>' +
    'info' +
    '</a>' +
    '</li>';

  html = '<tr class="post-' + postId + '">' +
    '<td class="mdl-data-table__cell--non-numeric">' + title + '</td>' +
    '<td>' + author + '</td>' +
    '<td class="avatar"></div></td>' +
    '</tr>';
  document.getElementsByClassName('mdl-checkbox')[0].style.display = 'none';
  var copy = document.getElementById("template").cloneNode(true);
  copy.id = "";
  copy.className = 'post-' + postId;
  copy.style.display = "";
  copy.cells[1].innerHTML = title;
  //copy.cells[2].innerHTML=author;
  var d = document.createElement('div');
  d.setAttribute('class', 'avatar')


  d.style.backgroundImage = 'url("' + (authorPic || './silhouette.jpg') + '")';
  copy.cells[2].appendChild(d);

  var titleSpan = document.createElement('span');
  var div = document.createElement('table');
  div.appendChild(copy);

  postElement = div.firstChild;
  //postElement= copy;
  console.log(postElement);
  //
  //console.log(postElement);
  // el.addEventListener('click', function () {
  //   alert('eric');
  // });
  if (componentHandler) {

    componentHandler.upgradeElements(postElement);
    componentHandler.upgradeElements(document.getElementById('inbox'));
    //componentHandler.upgradeElements(postElement.getElementsByClassName('mdl-list')[0]);
  }
  //postElement.getElementsByClassName('title')[0].innerText = title;
  //postElement.getElementsByClassName('keyword')[0].insertBefore(document.createTextNode(title),postElement.getElementsByClassName('keyword')[0].childNodes[0]);

  // this works
  //postElement.getElementsByClassName('username')[0].innerText = author || 'Anonymous';
  // postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
  //   (authorPic || './silhouette.jpg') + '")';

  //addListElement(postElement, "1", "data.val().author", "data.val().authorPic", "data.val().email" || "", "data.val().lastVisitTime" || "", "data.val().title" || "", "data.val().typedCount" || "", "data.val().url");

  return postElement;
}
window.onload = function () {
  initApp();
};

function createCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseCookie(name) {
  createCookie(name, "", -1);
}


