var React = require("react");
var Experiment = require("../../lib/experiment");
var Variation = require("../../lib/variation");

module.exports = React.createClass({
  propTypes: {
    userIdentifier: React.PropTypes.string.isRequired
  },
  render: function(){
    return <div>
      <Experiment ref="experiment" name="My Example" userIdentifier={this.props.userIdentifier}>
        <Variation name="A">
          <div>Section A</div>
        </Variation>
        <Variation name="B">
          <div>Section B</div>
        </Variation>
      </Experiment>
    </div>;
  }
});
