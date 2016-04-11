"use strict";

var App = React.createClass({
  displayName: "App",

  getInitialState: function getInitialState() {
    return { repos: [], selectedRepos: [], editionObject: null, exportComponent: null, importComponent: null, imported: "" };
  },
  componentDidMount: function componentDidMount() {
    this.updateViewToDatabase();
  },
  render: function render() {
    var _this = this;

    var reposComponents = this.state.repos.map(function (repo) {
      return React.createElement(
        "div",
        null,
        React.createElement(Repository, { key: repo.id, onEdit: _this.updateViewToDatabase, onSelectToggle: _this.toggleSelectedRepo, repo: repo })
      );
    });
    var editingComponent = null;
    if (this.state.editionObject) {
      editingComponent = React.createElement(RepositoryEditor, { onSave: this.createNew, onCancel: this.closeCreator, repo: this.state.editionObject });
    }
    return React.createElement(
      "div",
      null,
      React.createElement(
        "h1",
        null,
        "Application Management"
      ),
      reposComponents,
      React.createElement(
        "div",
        null,
        React.createElement(
          "button",
          { onClick: this.openCreator },
          "Create New"
        ),
        React.createElement(
          "button",
          { onClick: this.exportSelected },
          "Export Selected"
        ),
        React.createElement(
          "button",
          { onClick: this.importNew },
          "Import"
        )
      ),
      editingComponent,
      this.state.importComponent,
      this.state.exportComponent
    );
  },
  openCreator: function openCreator() {
    this.setState({ editionObject: {} });
  },
  closeCreator: function closeCreator() {
    this.setState({ editionObject: null });
  },
  createNew: function createNew(initial, newRepo) {
    addOrUpdateRepository(newRepo, function (newRepo) {
      this.updateViewToDatabase();
      this.closeCreator();
    }.bind(this));
  },
  exportSelected: function exportSelected() {
    var lines = [];
    for (var i in this.state.selectedRepos) {
      var obj = this.state.selectedRepos[i];
      //we need to ignore the id during export
      lines.push({ scm: obj.scm, keyword: obj.keyword, targetURL: obj.targetURL });
    }
    var stringifiedLines = JSON.stringify(lines);
    var exportComponent = React.createElement(
      ModalWindow,
      null,
      React.createElement(
        "p",
        null,
        stringifiedLines
      ),
      React.createElement(
        "button",
        { onClick: this.closeExport },
        "Close"
      )
    );
    this.setState({ exportComponent: exportComponent });
  },
  closeExport: function closeExport() {
    this.setState({ exportComponent: null });
  },
  importNew: function importNew() {
    var importComponent = React.createElement(
      ModalWindow,
      null,
      React.createElement(
        "div",
        null,
        React.createElement("textarea", { onChange: this.updateImportData })
      ),
      React.createElement(
        "div",
        null,
        React.createElement(
          "button",
          { onClick: this.doImport },
          "Import"
        ),
        React.createElement(
          "button",
          { onClick: this.closeImport },
          "Close"
        )
      )
    );
    this.setState({ importComponent: importComponent });
  },
  updateImportData: function updateImportData(event) {
    this.state.importData = event.target.value;
  },
  doImport: function doImport() {
    var objects = JSON.parse(this.state.importData);

    for (var i in objects) {
      addOrUpdateRepository(objects[i], this.updateImportedLines);
    }
    this.closeImport();
  },
  updateImportedLines: function updateImportedLines(object) {
    this.updateViewToDatabase();
  },
  closeImport: function closeImport() {
    this.updateViewToDatabase();
    this.setState({ importComponent: null });
  },
  toggleSelectedRepo: function toggleSelectedRepo(selected, repo) {
    //selected var represents if the box was checked (true) or unchecked (false)
    if (selected) {
      this.state.selectedRepos.push(repo);
    } else {
      var index = this.state.selectedRepos.indexOf(repo);
      this.state.selectedRepos.splice(index, 1);
    }
  },
  updateViewToDatabase: function updateViewToDatabase() {
    //load state from storage
    listRepositories(function (repos) {
      this.setState({ "repos": repos });
    }.bind(this));
  }
});
var ModalWindow = React.createClass({
  displayName: "ModalWindow",

  render: function render() {
    return React.createElement(
      "div",
      { style: this.style.overlayStyle },
      React.createElement(
        "div",
        { style: this.style.modalStyle },
        this.props.children
      )
    );
  },
  style: {
    overlayStyle: {
      z: 20,
      width: "100%",
      height: "100%",
      position: "fixed",
      left: 0,
      top: 0,
      backgroundColor: "rgba(50,50,50, 0.9)"
    },
    modalStyle: {
      margin: "50px",
      padding: "20px",
      backgroundColor: "white",
      display: "inline-block"
    }
  }
});
var RepositoryEditor = React.createClass({
  displayName: "RepositoryEditor",

  getInitialState: function getInitialState() {
    return { editedElement: {} };
  },
  componentDidMount: function componentDidMount() {
    //initialize temporary internal element with initial properties
    this.state.editedElement.scm = this.props.repo.scm;
    this.state.editedElement.keyword = this.props.repo.keyword;
    this.state.editedElement.targetURL = this.props.repo.targetURL;
  },
  render: function render() {
    return React.createElement(
      ModalWindow,
      null,
      React.createElement(
        "div",
        { style: this.style.line },
        "Repo Name : ",
        React.createElement("input", { type: "text", onChange: this.changeEvent("scm"), defaultValue: this.props.repo.scm })
      ),
      React.createElement(
        "div",
        { style: this.style.line },
        "Issues Keyword : ",
        React.createElement("input", { onChange: this.changeEvent("keyword"), type: "text", defaultValue: this.props.repo.keyword })
      ),
      React.createElement(
        "div",
        { style: this.style.line },
        "TargetUrl ",
        React.createElement("input", { type: "text", onChange: this.changeEvent("targetURL"), defaultValue: this.props.repo.targetURL })
      ),
      React.createElement(
        "div",
        { style: this.style.line },
        React.createElement(
          "button",
          { onClick: this.triggerSaveEvent },
          "Save"
        ),
        React.createElement(
          "button",
          { onClick: this.triggerCancelEvent },
          "Cancel"
        )
      )
    );
  },
  changeEvent: function changeEvent(property) {
    return function (event) {
      this.state.editedElement[property] = event.target.value;
    }.bind(this);
  },
  triggerSaveEvent: function triggerSaveEvent(event) {
    if (this.props.onSave) {
      this.props.onSave(this.props.repo, this.state.editedElement);
    }
  },
  triggerCancelEvent: function triggerCancelEvent() {
    if (this.props.onCancel) {
      this.props.onCancel(this.props.repo);
    }
  },
  style: {
    line: {
      margin: "5px"
    }
  }
});

var Repository = React.createClass({
  displayName: "Repository",

  getInitialState: function getInitialState() {
    return { editMode: false };
  },
  render: function render() {
    var editComponent = null;
    if (this.state.editMode) {
      editComponent = React.createElement(RepositoryEditor, { onSave: this.triggerEditEvent, onCancel: this.cancelEdition, repo: this.props.repo });
    }
    return React.createElement(
      "div",
      { style: this.style.line },
      React.createElement(
        "div",
        { style: this.style.lineElement },
        React.createElement("input", { onClick: this.triggerSelectionEvent, type: "checkbox" })
      ),
      React.createElement(
        "div",
        { style: this.style.lineElement },
        this.props.repo.scm
      ),
      React.createElement(
        "div",
        { style: this.style.lineElement },
        this.props.repo.keyword
      ),
      React.createElement(
        "div",
        { style: this.style.lineElement },
        this.props.repo.targetURL
      ),
      React.createElement(
        "div",
        { style: this.style.lineElement },
        React.createElement(
          "button",
          { onClick: this.startEdition },
          "Edit"
        ),
        React.createElement(
          "button",
          { onClick: this.delete },
          "Delete"
        )
      ),
      editComponent
    );
  },
  triggerEditEvent: function triggerEditEvent(originalState, newState) {
    newState.id = originalState.id;
    addOrUpdateRepository(newState, function () {
      if (this.props.onEdit) {
        this.props.onEdit();
        this.cancelEdition();
      }
    }.bind(this));
  },
  cancelEdition: function cancelEdition() {
    this.setState({ editMode: false });
  },
  triggerSelectionEvent: function triggerSelectionEvent(event) {
    this.props.onSelectToggle(event.target.checked, this.props.repo);
  },
  startEdition: function startEdition() {
    this.setState({ editMode: true });
  },
  delete: function _delete() {
    deleteRepository(this.props.repo);
    if (this.props.onEdit) {
      this.props.onEdit();
    }
  },
  style: {
    lineElement: {
      display: "inline-block",
      paddingLeft: "5px"
    },
    line: {}
  }
});
ReactDOM.render(React.createElement(App, null), document.getElementById('content'));

