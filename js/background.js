var config = {
  apiKey: 'AIzaSyDq8ZDd8gxJilYloZEpi6cYAk31OCK2MC0',
  databaseURL: 'https://cryptotrade-e6228.firebaseio.com',
  storageBucket: 'cryptotrade-e6228.appspot.com'
}
firebase.initializeApp(config)

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
function initApp () {
  // Listen for auth state changes.
  var auth
  firebase.auth().onAuthStateChanged(function (user) {
    console.log('User state change detected from the Background script of the Chrome Extension:', user)

    auth = user
  })

  var state

  chrome.runtime.onMessage.addListener(

    function (request, sender, sendResponse) {
      if (request.message == 'history') {
        chrome.history.onVisited.addListener(function (state2) {
          state = state2
        })

        if (typeof state !== 'undefined' && auth || false ) {
          if (auth.emailVerified || false) {
            //console.log(auth)
            console.log(state)

            var visited = firebase.database().ref('urls/')
            visited.push({
              email: auth.email,
              lastVisitTime: state.lastVisitTime,
              title: state.title,
              typedCount: state.typedCount,
              url: state.url
            })
          }
        }
        sendResponse({data: state})

      }
    })
}

window.onload = function () {
  initApp()
}
