//Import react-bootstrap elements

var { Button, Modal, Row, Table, PageHeader, Input} = window.ReactBootstrap;

var App = React.createClass({
  getInitialState : function(){
    return {repos : [], selectedRepos : [], editionObject : null, exportComponent : null, importComponent : null, imported : "", filter : ""};
  },
  componentDidMount : function(){
    this.updateViewToDatabase();
  },
  render: function() {
    var visibleRepos = this.state.filter === "" ? this.state.repos : this.state.repos.filter(repo => this.match(this.state.filter, repo));
    var reposComponents = visibleRepos.map(repo => {
      return <Repository key={repo.id} onEdit={this.updateViewToDatabase} onSelectToggle={this.toggleSelectedRepo} repo={repo} selected={this.isSelected(repo)}/>;
    });
    var editingComponent = null;
    if(this.state.editionObject){
      editingComponent = <RepositoryEditor onSave={this.createNew} onCancel={this.closeCreator} repo={this.state.editionObject} />;
    }
    return (
      <div>
        <div>
          <Input md={4} type="text" onChange={this.updateFilter} placeholder="Filter"/>
        </div>
        <Table striped bordered condensed hover>
          <thead>
            <RepositoryListHeader onSelection={this.toggleSelectAll}/>
          </thead>
          <tbody>
            {reposComponents}
          </tbody>
        </Table>
        <div>
          <Button onClick={this.openCreator}>Create New</Button>
          <Button onClick={this.exportSelected}>Export Selected</Button>
          <Button onClick={this.importNew}>Import</Button>
        </div>
        {editingComponent}
        {this.state.importComponent}
        {this.state.exportComponent}
      </div>
    );
  },
  openCreator : function(){
    this.setState({editionObject : {}});
  },
  closeCreator : function(){
    this.setState({editionObject : null});
  },
  createNew : function(initial, newRepo){
    addOrUpdateRepository(newRepo, function(newRepo){
      this.updateViewToDatabase();
      this.closeCreator();
    }.bind(this));
  },
  exportSelected : function(){
    var lines = [];
    for(var i in this.state.selectedRepos){
      var obj = this.state.selectedRepos[i];
      //we need to ignore the id during export
      lines.push({scm : obj.scm, keyword : obj.keyword, targetURL : obj.targetURL, type : obj.type});
    }
    var stringifiedLines = JSON.stringify(lines);
    var exportComponent = (
      <Modal show={true}>
        <Modal.Body>
          <p>{stringifiedLines}</p>
          <Button onClick={this.closeExport}>Close</Button>
        </Modal.Body>
      </Modal>
    );
    this.setState({exportComponent : exportComponent});
  },
  closeExport : function(){
    this.setState({exportComponent : null});
  },
  importNew : function(){
    var importComponent = (<RepositoryImporter onClose={this.closeImport} onImport={this.doImport}/>);
    this.setState({importComponent : importComponent});
  },
  doImport : function(objects){
    for(var i in objects){
      addOrUpdateRepository(objects[i], this.updateImportedLines);
    }
    this.closeImport();
  },
  updateImportedLines : function(object){
    this.updateViewToDatabase();
  },
  closeImport : function(){
    this.updateViewToDatabase();
    this.setState({importComponent : null});
  },
  toggleSelectedRepo : function(selected, repo){
    //selected var represents if the box was checked (true) or unchecked (false)
    if(selected){
      this.state.selectedRepos.push(repo);
      console.log(this.state.selectedRepos);
      this.setState({selectedRepos : this.state.selectedRepos});
    }else{
      var index = this.state.selectedRepos.indexOf(repo);
      this.state.selectedRepos.splice(index, 1);
      this.setState({selectedRepos : this.state.selectedRepos});
    }
  },
  toggleSelectAll : function(selected){
    if(selected){
      var allSelected = [].concat(this.state.repos);
      this.setState({selectedRepos : allSelected});
    }else{
      this.setState({selectedRepos : []});
    }
  },
  updateViewToDatabase : function(){
    //load state from storage
    listRepositories(function(repos){
      this.setState({"repos" : repos});
    }.bind(this));
  },
  isSelected : function(repo){
    return this.state.selectedRepos.indexOf(repo) > -1;
  },
  updateFilter : function(e){
    this.setState({filter : e.target.value});
  },
  match : function(filter, repo){
    filter = filter.toLowerCase()
    var keyMatches = repo.keyword && repo.keyword.toLowerCase().indexOf(filter) > -1;
    var urlMatches = repo.targetURL && repo.targetURL.toLowerCase().indexOf(filter) > -1;
    var typeMatches = repo.type && repo.type.toLowerCase().indexOf(filter) > -1;
    var scmMatches = repo.scm && repo.scm.toLowerCase().indexOf(filter) > -1;
    return keyMatches || urlMatches || typeMatches || scmMatches;
  }
});
var RepositoryImporter = React.createClass({
  getInitialState : function(){
    return {type : "YouTrack", importParameter : ""};
  },
  render : function(){
    var inputType;
    var inputLabel;
    if(this.state.type == "string"){
      inputType = "textarea";
      inputLabel = "";
    }
    if(this.state.type == "YouTrack"){
      inputType = "text";
      inputLabel = "YouTrack URL";
    }

    return(
      <Modal show={true}>
        <Modal.Body>
          <div>
            <Input type="select" onChange={this.updateType} label="Import From">
              <option value="YouTrack">YouTrack</option>
              <option value="string">Exported Json</option>
            </Input>
          </div>
          <div>
            <Input onChange={this.updateImportParameter} label={inputLabel} type={inputType}/>
          </div>
          <div>
            <Button onClick={this.triggerImport}>Import</Button>
            <Button onClick={this.props.onClose}>Close</Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  },
  updateImportParameter : function(event){
    this.state.importParameter = event.target.value;
  },
  triggerImport : function(){
    if(this.state.type == "string"){
      var objects = JSON.parse(this.state.importParameter);
      this.props.onImport(objects);
    }
    if(this.state.type == "YouTrack"){
      var url = this.state.importParameter;
      if(!url.endsWith("/")){
        url += "/";
      }
      var apiUrl = url + "rest/project/all";
      $.get(apiUrl, projects => this.importProjects(url, projects), "json");
    }
  },
  updateType: function(e){
    this.setState({type : e.target.value});
  },
  importProjects : function(baseUrl, projects){
    var newProjects = [];
    for(var i in projects){
      var bestEffortName = projects[i].name.replace(/\s/g, '').toLowerCase();
      var newProject = {scm : bestEffortName};
      newProject.keyword = projects[i].shortName;
      newProject.targetURL = baseUrl + "issue/";
      newProject.type = "YouTrack";
      newProjects.push(newProject);
    }
    this.props.onImport(newProjects);
  }
});

var RepositoryEditor = React.createClass({
  getInitialState : function(){
    return {editedElement : {}};
  },
  componentDidMount : function(){
    //initialize temporary internal element with initial properties
    this.state.editedElement.scm = this.props.repo.scm;
    this.state.editedElement.keyword = this.props.repo.keyword;
    this.state.editedElement.targetURL = this.props.repo.targetURL;
    this.state.editedElement.type = this.props.repo.type;
  },
  render: function() {
    return (
      <Modal show={true}>
        <Modal.Body>
          <div style={this.style.line}>
            <Input type="text" label="Repo Name" onChange={this.changeEvent("scm")} defaultValue={this.props.repo.scm}/>
          </div>
          <div style={this.style.line}>
            <Input label="Issues Keyword" onChange={this.changeEvent("keyword")} type="text" defaultValue={this.props.repo.keyword}/>
          </div>
          <div style={this.style.line}>
            <Input label="Target URL" type="text" onChange={this.changeEvent("targetURL")} defaultValue={this.props.repo.targetURL}/>
          </div>
          <div style={this.style.line}>
            <Input label="Type" type="select" onChange={this.changeEvent("type")}>
              <option value="YouTrack" selected={this.props.repo.type == "YouTrack" }>YouTrack</option>
              <option selected={this.props.repo.type === undefined}>Unknown</option>
            </Input>
          </div>
          <div style={this.style.line}>
          <Button onClick={this.triggerSaveEvent}>Save</Button>
          <Button onClick={this.triggerCancelEvent}>Cancel</Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  },
  changeEvent : function(property){
    return function(event){
      this.state.editedElement[property] = event.target.value;
    }.bind(this);
  },
  triggerSaveEvent: function(event){
    if(this.props.onSave){
      this.props.onSave(this.props.repo, this.state.editedElement);
    }
  },
  triggerCancelEvent: function(){
    if(this.props.onCancel){
      this.props.onCancel(this.props.repo);
    }
  },
  style : {
    line : {
      margin : "5px"
    }
  }
});
var RepositoryListHeader = React.createClass({
  render : function(){
    return(
      <tr>
        <td md={1}><input onClick={this.triggerSelectionEvent} type="checkbox"/></td>
        <td md={2}>Repository</td>
        <td md={1}>Key</td>
        <td md={2}>TargetURL</td>
        <td md={1}>Type</td>
        <td md={5}>
          <span></span>
        </td>
      </tr>
    );
  },
  triggerSelectionEvent : function(event){
    if(this.props.onSelection){
      this.props.onSelection(event.target.checked);
    }
  }
});

var Repository = React.createClass({
  getInitialState : function(){
    return {editMode : false};
  },
  render: function() {
    var editComponent = null;
    if(this.state.editMode){
      editComponent = <RepositoryEditor onSave={this.triggerEditEvent} onCancel={this.cancelEdition} repo={this.props.repo} />;
    }

    return (
      <tr>
        <td md={1}><input onChange={this.triggerSelectionEvent} type="checkbox" checked={this.props.selected}/></td>
        <td md={2}>{this.props.repo.scm}</td>
        <td md={1}>{this.props.repo.keyword}</td>
        <td md={2}>{this.props.repo.targetURL}</td>
        <td md={1}>{this.props.repo.type || "Unknown"}</td>
        <td md={5}>
          <Button onClick={this.startEdition}>Edit</Button>
          <Button onClick={this.delete}>Delete</Button>
        </td>
        {editComponent}
      </tr>
    );
  },
  triggerEditEvent : function(originalState, newState){
    newState.id = originalState.id;
    addOrUpdateRepository(newState, function(){
      if(this.props.onEdit){
        this.props.onEdit();
        this.cancelEdition();
      }
    }.bind(this));
  },
  cancelEdition : function(){
    this.setState({editMode : false});
  },
  triggerSelectionEvent: function(event){
    this.props.onSelectToggle(event.target.checked, this.props.repo);
  },
  startEdition :function(){
    this.setState({editMode : true});
  },
  delete : function(){
    deleteRepository(this.props.repo);
    if(this.props.onEdit){
      this.props.onEdit();
    }
  }
});
ReactDOM.render(
  <App />,
  document.getElementById('content')
);
