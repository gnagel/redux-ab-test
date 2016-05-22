var React = require('react');
var ReactDOM = require('react-dom');
var Experiment = require("../../lib/experiment");
var Variation = require("../../lib/variation");
var experimentDebugger = require("../../lib/debugger");

experimentDebugger.enable();

var App = React.createClass({
  render() {
    return <div>
      <h1>Experiment 1</h1>
      <Experiment name="Experiment 1">
        <Variation name="A">
          <h2>Variation A</h2>
        </Variation>
        <Variation name="B">
          <h2>Variation B</h2>
        </Variation>
      </Experiment>
      <h1>Experiment 2</h1>
      <Experiment name="Experiment 2">
        <Variation name="X">
          <h2>Variation X</h2>
        </Variation>
        <Variation name="Y">
          <h2>Variation Y</h2>
        </Variation>
      </Experiment>
    </div>;
  }
});

ReactDOM.render(<App/>, document.getElementById('react'));
