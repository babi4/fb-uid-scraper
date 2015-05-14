chrome.runtime.onInstalled.addListener(function () {
    // alert("Fixed error of long graph search query.\n Extension is working now");
    // alert("Please give me good review to My Kindle Book. Thanks\nClean Eating Recipes: Clean Eating: 25 Delicious Clean Eating Recipes, Eating Meal Plan and Shopping List");
    // chrome.tabs.create({ url: 'http://www.amazon.com/dp/B00WD34HX8' });

});
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    if (details.transitionType == "link") {
        chrome.tabs.sendMessage(details.tabId, details.url);
    }
});
//chrome.browserAction.onClicked.addListener(function () {
//    //"default_popup": "popup.html",
//    setTimeout(function () {
//        var icon = 'icons/icon.png', title = 'Title', text = 'Text';
//        var notification;
//        if (window.webkitNotifications) {
//            notification = webkitNotifications.createNotification(icon, title, text);
//        }
//        else {
//            notification = new Notification(title, {
//                body: text,
//                icon: icon
//            });
//        }
//        notification.onclick = function (x) { window.focus(); this.close(); };
//        //notification.show();
//    }, 10000);

//});