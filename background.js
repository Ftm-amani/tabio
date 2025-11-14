
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

async function getGoogleAuthToken() {
    return new Promise((resolve) => {
        chrome.identity.getAuthToken({ 'interactive': true }, (token) => {
            if (chrome.runtime.lastError) {
                console.error("Auth Error:", chrome.runtime.lastError.message);
                resolve(null);
            } else {
                resolve(token);
            }
        });
    });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "LOGIN_GOOGLE") {
        getGoogleAuthToken().then(sendResponse);
        return true;
    }
});