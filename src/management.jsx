var App = React.createClass({
  getInitialState : function(){
    return {repos : [], selectedRepos : [], editionObject : null, exportComponent : null, importComponent : null, imported : ""};
  },
  componentDidMount : function(){
    this.updateViewToDatabase();
  },
  render: function() {
    var reposComponents = this.state.repos.map(repo => {
      return (<div>
                <Repository key={repo.id} onEdit={this.updateViewToDatabase} onSelectToggle={this.toggleSelectedRepo} repo={repo} />
              </div>);
    });
    var editingComponent = null;
    if(this.state.editionObject){
      editingComponent = <RepositoryEditor onSave={this.createNew} onCancel={this.closeCreator} repo={this.state.editionObject} />;
    }
    return (
      <div>
        <h1>Application Management</h1>
        {reposComponents}
        <div>
          <button onClick={this.openCreator}>Create New</button>
          <button onClick={this.exportSelected}>Export Selected</button>
          <button onClick={this.importNew}>Import</button>
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
      lines.push({scm : obj.scm, keyword : obj.keyword, targetURL : obj.targetURL});
    }
    var stringifiedLines = JSON.stringify(lines);
    var exportComponent = (
      <ModalWindow>
        <p>{stringifiedLines}</p>
        <button onClick={this.closeExport}>Close</button>
      </ModalWindow>
    );
    this.setState({exportComponent : exportComponent});
  },
  closeExport : function(){
    this.setState({exportComponent : null});
  },
  importNew : function(){
    var importComponent = (
      <ModalWindow>
        <div>
          <textarea onChange={this.updateImportData}></textarea>
        </div>
        <div>
          <button onClick={this.doImport}>Import</button>
          <button onClick={this.closeImport}>Close</button>
        </div>
      </ModalWindow>
    );
    this.setState({importComponent : importComponent});
  },
  updateImportData : function(event){
    this.state.importData = event.target.value;
  },
  doImport : function(){
    var objects = JSON.parse(this.state.importData);

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
    }else{
      var index = this.state.selectedRepos.indexOf(repo);
      this.state.selectedRepos.splice(index, 1);
    }
  },
  updateViewToDatabase : function(){
    //load state from storage
    listRepositories(function(repos){
      this.setState({"repos" : repos});
    }.bind(this));
  }
});
var ModalWindow = React.createClass({
  render : function(){
    return (
      <div style={this.style.overlayStyle}>
        <div style={this.style.modalStyle}>
          {this.props.children}
        </div>
      </div>
    );
  },
  style : {
    overlayStyle : {
      z : 20,
      width : "100%",
      height : "100%",
      position : "fixed",
      left : 0,
      top : 0,
      backgroundColor : "rgba(50,50,50, 0.9)",
    },
    modalStyle : {
      margin : "50px",
      padding : "20px",
      backgroundColor : "white",
      display : "inline-block"
    }
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
  },
  render: function() {
    return (
      <ModalWindow>
          <div style={this.style.line}>
            Repo Name : <input type="text" onChange={this.changeEvent("scm")} defaultValue={this.props.repo.scm}/>
          </div>
          <div style={this.style.line}>
            Issues Keyword : <input onChange={this.changeEvent("keyword")} type="text" defaultValue={this.props.repo.keyword}/>
          </div>
          <div style={this.style.line}>
            TargetUrl <input type="text" onChange={this.changeEvent("targetURL")} defaultValue={this.props.repo.targetURL}/>
          </div>
          <div style={this.style.line}>
          <button onClick={this.triggerSaveEvent}>Save</button>
          <button onClick={this.triggerCancelEvent}>Cancel</button>
          </div>
      </ModalWindow>
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
      <div style={this.style.line}>
        <div style={this.style.lineElement}>
          <input onClick={this.triggerSelectionEvent} type="checkbox" />
        </div>
        <div style={this.style.lineElement}>{this.props.repo.scm}</div>
        <div style={this.style.lineElement}>{this.props.repo.keyword}</div>
        <div style={this.style.lineElement}>{this.props.repo.targetURL}</div>
        <div style={this.style.lineElement}>
          <button onClick={this.startEdition}>Edit</button>
          <button onClick={this.delete}>Delete</button>
        </div>
        {editComponent}
      </div>
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
  },
  style : {
    lineElement : {
      display : "inline-block",
      paddingLeft : "5px"
    },
    line : {

    }
  }
});
ReactDOM.render(
  <App />,
  document.getElementById('content')
);
