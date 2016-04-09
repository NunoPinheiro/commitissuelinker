String.prototype.replaceAll = function(search, replace)
{
    //if replace is not sent, return original string otherwise it will
    //replace search string with 'undefined'.
    if (replace === undefined) {
        return this.toString();
    }

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};


var repoFromLink = window.location.pathname.split("/")[2];

listRepositories(function(repos){
    var repo = repos.find(repo => repo.scm == repoFromLink);
    if(repo){
      processRepo(repo);
    }
});

function processRepo(repo){
  var commentBody = $(".comment-body, .commit-title, .commit-desc");
  var splittedBody = commentBody.text().split(" ");
  for( var i in splittedBody){
    var text = splittedBody[i];
    if (splittedBody[i].indexOf(repo.keyword) > -1){
      //Clean the link from some symbols usually added to destinguish issue-id from commit message
      var cleanedText = text.replaceAll("[", "").replaceAll("\\]", "").replaceAll("#", "");
      commentBody.html(commentBody.html().replace(text, '<a href="' + repo.targetURL + cleanedText + '">' + text + '</a>'));
    }
  }
}
