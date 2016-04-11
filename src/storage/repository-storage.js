/*
** Abstractions manipulate repos from storage
** We are by default writting to a synched storage, this enables the same user to use her settings in multiple machines
*/

/*
** Repository objects should have the following fields :
**    scm for the project to be processed
**    keyword the keyword to be processed
**    targetURL  for the issue tracker URL
*/

function addOrUpdateRepository(repository, callback){
  var query = {};
  var key = repository.id;
  if(!key){
    // Create a random id for the object, this code part should be improved in the future
    key = Math.random().toString(36);
    repository.id = key;
  }
  query[key] = repository;
  chrome.storage.sync.set(query, function(){
    callback(repository);
  });
}

function listRepositories(callback){
  chrome.storage.sync.get(null, function(repos){
    //unserialize from chrome storage format
    var reposArray = [];
    for(var repo in repos){
      reposArray.push(repos[repo]);
    }
    callback(reposArray);
  });
}

function deleteRepository(repository, callback){
  chrome.storage.sync.remove(repository.id, callback);
}
