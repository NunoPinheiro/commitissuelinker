document.getElementById("openManagement").addEventListener("click", function(){
    chrome.tabs.create({url : "src/management.html"});
});
