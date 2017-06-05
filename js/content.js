// Initialize Firebase
var config = {
  apiKey: "AIzaSyDq8ZDd8gxJilYloZEpi6cYAk31OCK2MC0",
  authDomain: "cryptotrade-e6228.firebaseapp.com",
  databaseURL: "https://cryptotrade-e6228.firebaseio.com",
  projectId: "cryptotrade-e6228",
  storageBucket: "cryptotrade-e6228.appspot.com",
  messagingSenderId: "92373556015"
};
firebase.initializeApp(config);
defaultDatabase = firebase.database();

var state

chrome.runtime.sendMessage({
  message: "history"
}, function (response) {

  state = response.data
  
  if(typeof state !== 'undefined'){
    console.log(state);
    var visited = firebase.database().ref('urls/')
    visited.push({
      lastVisitTime: state.lastVisitTime,
      title: state.title,
      typedCount:state.typedCount,
      url:state.url
    })
  }
});


