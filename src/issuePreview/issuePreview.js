//Add tip styles to page
function addStyle(path){
  var link = document.createElement("link");
  link.href = chrome.extension.getURL(path);
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);
}

addStyle("vendor/opentip/css/opentip.css");
addStyle("src/issuePreview/issuePreview.css");

issuePreviewer = {
  enableIssuePreview : function(repo, id, selectorPart){
    if(youtrackHandler.isCompatible(repo)){
      url = youtrackHandler.getRestURL(repo) + id;
      $.ajax({
        url : url,
        success : content => this.setupTip(content, selectorPart),
        dataType : "json"
      });
    }
  },
  setupTip : function(content, selectorID){
    var summary = content.field[2].value;
    var description = content.field[3].value;
    summary =  $('<div/>').text(summary).html();
    description =  "<pre>" + $('<div/>').text(description).html() + "</pre>";
    console.log(description);
    var selector = '*[data-tracker-issue-id="' + selectorID + '"]';
    var config = {showOn: 'mouseover', hideTriggers: ["tip", "trigger", "target"], hideOn : "mouseout", style : "glass"};
    new Opentip(selector, description, summary, config);
  },
  escapeString : function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }
};

youtrackHandler = {
    isCompatible : function(repo){
      if(repo.type == "YouTrack"){
        return true;
      }
      else if(repo.targetURL.split("/")[3] == "youtrack"){
        //We automatically detect if a repo is using youtrack from the url
        return true;
      }
      return false;
    },
    getRestURL : function(repo){
      if(repo.restAddress){
        return repo.restAddress;
      }
      else{
        //Calculate the address by adding "rest" before the "issue" segment
        //This works since all the youtrack pages are in the format host/[contextPath/]issue

        var splittedUrl = repo.targetURL.split("/");
        var issuePartIndex = splittedUrl.indexOf("issue");
        var apiUrl = "";
        for(var i = 0; i < issuePartIndex; i++){
          apiUrl += splittedUrl[i]  + "/";
        }
        apiUrl += "rest/";
        for(i = issuePartIndex; i < splittedUrl.length; i++){
          if(splittedUrl[i] !== ""){
            apiUrl += splittedUrl[i]  + "/";
          }
        }
        return apiUrl;
      }
    }
};

previewWindowHandler = function(el){

};
