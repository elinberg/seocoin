

var state;
var state;

chrome.runtime.sendMessage({ message: 'history' }, function (response) {

    state = response.data
    if (state || false) {
        console.log(response.data)

    }
});

