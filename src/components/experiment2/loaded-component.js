import React                  from 'react';
import { connect }            from 'react-redux';
import { bindActionCreators } from 'redux';
import ImmutablePropTypes     from 'react-immutable-proptypes';
import {
  play,
  activate,
  deactivate,
}                             from '../../module';
import { logger }             from './logger';
import {
  groupChildrenByName,
  requireChildrenAreVariations,
}                             from './selectors';


class LoadedComponent extends React.Component {
  static propTypes = {
    // Name of the experiment
    experimentName:  React.PropTypes.string.isRequired,
    variationName:   React.PropTypes.string.isRequired,
    // Experiment and Variation objects passed to the play / activate / deactivate action-creators:
    experiment:      ImmutablePropTypes.map,
    variation:       ImmutablePropTypes.map,
    // React element to render:
    children:        requireChildrenAreVariations,
    // Bound Action Creators
    play:            React.PropTypes.func.isRequired,
    activate:        React.PropTypes.func.isRequired,
    deactivate:      React.PropTypes.func.isRequired,
  };

  render() {
    const { experimentName, variationName, children } = this.props;
    logger(`${__filename}: Rendering Experiment experimentName='${experimentName}', variationName='${variationName}'`);

    // Group the children by name
    const childrenByName = groupChildrenByName(children);
    logger(`${__filename}: Experiment experimentName='${experimentName}', variationName='${variationName}' has children with names='${Object.keys(childrenByName)}'`);

    // Find the Variation with the matching name
    const child = childrenByName[variationName] || null;
    if (!child) {
      throw new Error(`variationName=${variationName} not found`);
    }

    // Return the Variation
    logger(`${__filename}: Rendered Experiment experimentName='${experimentName}', variationName='${variationName}'`);
    return child;
  }

  //
  // Component Lifecycle
  //

  // Record the experiment will be mounted
  componentWillMount() {
    const { experimentName, variationName, experiment, variation, play } = this.props;
    logger(`${__filename}: componentWillMount: Experiment experimentName='${experimentName}', variationName='${variationName}'`);
    if (play && experiment && variation) {
      play({ experiment, variation });
    }
  }

  // Record we mounted the experiment
  componentDidMount() {
    const { experimentName, variationName, experiment, activate } = this.props;
    logger(`${__filename}: componentDidMount: Experiment experimentName='${experimentName}', variationName='${variationName}'`);
    if (activate && experiment) {
      activate({ experiment });
    }
  }

  // Record we un-mounted the experiment
  componentWillUnmount() {
    const { experimentName, variationName, experiment, deactivate } = this.props;
    logger(`${__filename}: componentWillUnmount: Experiment experimentName='${experimentName}', variationName='${variationName}'`);
    if (deactivate && experiment) {
      deactivate({ experiment });
    }
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({ play, activate, deactivate }, dispatch);
export default connect(null, mapDispatchToProps)(LoadedComponent);
