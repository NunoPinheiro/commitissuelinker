//Add tip styles to page
var link = document.createElement("link");
link.href = chrome.extension.getURL("vendor/opentip/css/opentip.css");
link.type = "text/css";
link.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(link);

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
    var selector = '*[data-tracker-issue-id="' + selectorID + '"]';
    var config = {showOn: 'mouseover', hideTriggers: ["tip", "trigger", "target"], hideOn : "mouseout", style : "glass"};
    new Opentip(selector, description, summary, config);
  }
};

youtrackHandler = {
    isCompatible : function(repo){
      if(repo.youTrack){
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
        //Calculate the address by adding "rest" after the "youtrack" segment
      }
      var splittedUrl = repo.targetURL.split("/");
      var apiUrl = "";
      for(var i = 0; i <= 3; i++){
        apiUrl += splittedUrl[i]  + "/";
      }
      apiUrl += "rest/";
      for(i = 4; i < splittedUrl.length; i++){
        if(splittedUrl[i] != ""){
          apiUrl += splittedUrl[i]  + "/";
        }
      }
      return apiUrl;
    }
};

previewWindowHandler = function(el){

};
