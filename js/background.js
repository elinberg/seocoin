var config = {
  apiKey: 'AIzaSyDq8ZDd8gxJilYloZEpi6cYAk31OCK2MC0',
  databaseURL: 'https://cryptotrade-e6228.firebaseio.com',
  storageBucket: 'cryptotrade-e6228.appspot.com'
}
firebase.initializeApp(config)

/**
 * This is currently duplicate code (it also appears in credential.js)
 * This function and other cookie functions should be put in their own file
 * at some point...
 */
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

function readSearchQuery(url) {
  url = url.split('?');

  var query = url[1];
  var params = {};

  url = url[0];

  if (query === undefined || url.match(/www.google.com/) === undefined) {
    return null;
  }

  query = query.split('&');

  query.forEach(function(elem) {
    elem = elem.split('=');

    params[elem[0]] = elem[1];
  });

  if (params.q === undefined) {
    return null;
  }

  return params.q.replace(/\+/, ' ').toLowerCase();
}

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



//=============== background.js =================
chrome.runtime.onInstalled.addListener(function (details) {
  try {
    var thisVersion = chrome.runtime.getManifest().version;
    if (details.reason == "install") {
      console.info("First version installed");
      //Send message to popup.html and notify/alert user("Welcome")
    } else if (details.reason == "update") {
      console.info("Updated version: " + thisVersion);
      //Send message to popup.html and notify/alert user

      chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        for( var i = 0; i < tabs.length; i++ ) {
            chrome.tabs.sendMessage(tabs[i].id, {name: "showPopupOnUpdated", version: thisVersion});
        }
        });
    }
  } catch(e) {
    console.info("OnInstall Error - " + e);
  }
});
  // Listen for auth state changes.
  var auth, currentUID
  firebase.auth().onAuthStateChanged(function (user) {
    if (user && currentUID === user.uid) {
      return;
    }
    console.log('User state change detected from the Background script of the Chrome Extension:', user)
    if (user) {
      if (!user.displayName || !user.photoURL) {
        var displayName;
        var profilePic;
        user.providerData.forEach(function (profile) {
          console.log("Sign-in provider: " + profile.providerId);
          console.log("  Provider-specific UID: " + profile.uid);
          console.log("  Name: " + profile.displayName);
          displayName = profile.displayName;
          profilePic = profile.photoURL;
          console.log("  Email: " + profile.email);
          console.log("  Photo URL: " + profile.photoURL);
        });


        user.updateProfile({ displayName: displayName, photoURL: profilePic }).then(
          function () {
            console.log(displayName);
          }, function (error) {
            console.log(error);
          });
      };

      currentUID = user.uid;

    } else {
      // Set currentUID to null.
      currentUID = null;

    }
    auth = user
  })

  var state

  chrome.runtime.onMessage.addListener(

    function (request, sender, sendResponse) {
      if (request.message == 'history') {
        chrome.history.onVisited.addListener(function (state2) {
          state = state2
        })

        if (typeof state !== 'undefined' && auth || false) {
          if (auth.emailVerified || false) {
            //console.log(auth)
            console.log(state)

            // var visited = firebase.database().ref('history/')
            // visited.push({
            //   email: auth.email,
            //   lastVisitTime: state.lastVisitTime,
            //   title: state.title,
            //   typedCount: state.typedCount,
            //   url: state.url,
            //   author: auth.displayName,
            //   authorPic: auth.photoURL
            // });

            var postId = readCookie('seocoin.id')
            if (!!postId.length) {
              var db = firebase.database();
              var currentPost = db.ref('posts/' + postId);
              var comments = db.ref('post_comments/' + postId)

              currentPost.once('value', function (data) {
                console.log(data.val());
                var isAtDestination = state.url == data.val().destination_url;
                var isAtSearchQuery = readSearchQuery(state.url) == data.val().keyword.toLowerCase();

                if (isAtDestination || isAtSearchQuery) {
                  console.log('Pushing state');
                  comments.push({
                    email: auth.email,
                    lastVisitTime: state.lastVisitTime,
                    title: state.title,
                    typedCount: state.typedCount,
                    url: state.url,
                    author: auth.displayName,
                    authorPic: auth.photoURL
                  });
                }
              })
            }
          }
        }
        sendResponse({ data: state })

      }
    })

}

window.onload = function () {
  initApp()
}
