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
    var repos = repos.filter(repo => repo.scm == repoFromLink);
    if(repos){
      processRepo(repos);
    }
});


function processRepo(repos){
  var components = $(".comment-body, .commit-title, .commit-desc");

  for(var componentIndex = 0; componentIndex < components.length; componentIndex++){
    var commentBody = $(components[componentIndex]);
    var splittedBody = commentBody.html().toString().split(" ");
    for( var i in splittedBody){
      var text = splittedBody[i];
      for(var j in repos){
        var repo = repos[j];
        if (splittedBody[i].indexOf(repo.keyword) > -1){
          //Clean the link from some symbols usually added to destinguish issue-id from commit message
          var cleanedText = text.replaceAll("[", "").replaceAll("\\]", "").replaceAll("#", "").trim();

          commentBody.html(commentBody.html().replace(text, '<a href="' + repo.targetURL + cleanedText + '">' + text + '</a>'));
        }
      }
    }
  }

}
