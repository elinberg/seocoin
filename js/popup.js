//=============== popup.js =================
//Note: this has to be injected as content script from manifest.json
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.name) {
        case "showPopupOnUpdated":
            alert("Extension got updated to latest version: " + request.version);
            break;
    }
});

