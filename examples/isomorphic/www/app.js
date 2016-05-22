var React = require('react');
var ReactDOM = require('react-dom');
var Component = require("../component");

var container = document.getElementById("react-mount");
ReactDOM.render(<Component userIdentifier={SESSION_ID} />, container);
