String.prototype.replaceAll = function(search, replace)
{
    //if replace is not sent, return original string otherwise it will
    //replace search string with 'undefined'.
    if (replace === undefined) {
        return this.toString();
    }

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};

// GitHub is using pjax to reload the page. This means the browser will not detect the page change event
// We need to trigger our plugin when a page change occurs
$(document).on('pjax:end', function() {
  injectPage();
});

injectPage();

function injectPage(){
  var splittedURL = window.location.pathname.split("/");
  var isCommitListPage = splittedURL.indexOf("commits") > -1;
  //Only inject on pages related to a project, and are not a commit listing
  if(splittedURL.length > 2 && !isCommitListPage){
    var repoFromLink = splittedURL[2];

    listRepositories(function(repos){
        var repos = repos.filter(repo => repo.scm == repoFromLink);
        if(repos){
          processRepo(repos);
        }
    });
  }
}


function processRepo(repos){
  var components = $(".comment-body, .commit-title, .commit-desc");

  for(var componentIndex = 0; componentIndex < components.length; componentIndex++){
    var commentBody = $(components[componentIndex]);
    var splittedBody = commentBody.text().toString().split(" ");
    for( var i in splittedBody){
      var text = splittedBody[i];
      for(var j in repos){
        var repo = repos[j];
        if (splittedBody[i].indexOf(repo.keyword) > -1){
          //Clean the link from some symbols usually added to destinguish issue-id from commit message
          var cleanedText = text.replaceAll("[", "").replaceAll("\\]", "").replaceAll("#", "").trim();
          debugger;
          commentBody.html(commentBody.html().replace(text.trim(), '<a href="' + repo.targetURL + cleanedText + '">' + text + '</a>'));
        }
      }
    }
  }

}
