var App = React.createClass({
  getInitialState : function(){
    return {repos : [], selectedRepos : [], editionObject : null};
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
        </div>
        {editingComponent}
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

  },
  importNew : function(){
    
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
      <div style={this.style.overlayStyle}>
        <div style={this.style.modalStyle}>
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
        </div>
      </div>
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
    },
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
          <input onClick={this.props.triggerSelectionEvent} type="checkbox" />
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
