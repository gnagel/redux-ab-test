import React                  from 'react';
import Immutable              from 'immutable';
import { connect }            from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  play,
  activate,
  deactivate,
}                             from '../../module';
import Variation              from './variation';
import { logger }             from './logger';


class Experiment extends React.Component {
  render() {
    const { name, children } = this.props;
    logger(`Rendering Experiment name='${name}'`);

    // Group the children by name
    const childrenByName = this.groupChildrenByName();
    logger(`Experiment name='${name}' has children with names='${Object.keys(childrenByName)}'`);

    // Lookup the experiment and variation for this experiment
    const exeriment = this._experiment || this.getExperiment();
    const variation = this._variation || this.getVariation(experiment);

    // Find the attached exeriment & variation for this component
    if (!exeriment) {
      logger(`Experiment name='${name}' didn't have a valid exeriment`);
      return null;
    }
    if (!variation) {
      logger(`Experiment name='${name}' didn't have a valid variation`);
      return null;
    }
    // Find the variation child with the matching name
    const variationName = variation.get('name');
    const child = childrenByName[variationName] || null;
    if (!child) {
      logger(`Experiment name='${name}' found no variation matching variation.name='${variationName}'`);
      return null;
    }
    // Return the rendered child
    logger(`Rendered Experiment name='${name}', variation.name='${variationName}'`);
    return child;
  }

  //
  // Helpers:
  //

  groupChildrenByName = () => {
    const childrenByName = {};
    if (React.Children.count(children) === 0) {
      childrenByName[ children.props.name ] = children;
    } else {
      React.Children.map(child => {
        child[child.props.name] = child;
      });
    }
    return childrenByName;
  };

  groupExperimentsByName = () => {
    const { reduxAbTest } = this.props;
    const experiments = reduxAbTest.getIn(['experiments'], Immutable.List());
    const experimentsByName = {};
    experiments.forEach(e => {
      experimentsByName[e.get('name', '').toLowerCase()] = e;
    });
    return experimentsByName;
  };

  getExperiment = () => {
    const { name } = this.props;
    return this.groupExperimentsByName()[name];
  };

  getVariation = (experiment) => {
    if (!experiment) {
      return null;
    }
    const variations = {};
    experiment.get('variations', Immutable.List()).forEach(variation => {
      variations[variation.get('name', '')] = variation;
    });
    return variations;
  };

  //
  // Component Lifecycle
  //

  // Activate the variation
  componentWillMount() {
    const { play } = this.props;
    const experiment = this.experiment();
    const variation = this.variation();
    // Record the experiment was shown
    if (play && experiment && variation) {
      play({ experiment, variation });
    }
    this._experiment = experiment;
    this._variation = variation;
  }

  // Activate the variation
  componentDidMount() {
    const { activate } = this.props;
    const experiment = this.experiment();
    if (activate && experiment) {
      activate({ experiment });
    }
    this._experiment = null;
    this._variation = null;
  }

  // Dispatch the deactivation event
  componentWillUnmount() {
    const { deactivate } = this.props;
    const experiment = this.experiment();
    if (deactivate && experiment) {
      deactivate({ experiment });
    }
    this._experiment = null;
    this._variation = null;
  }
}


export const requireChildType = (componentName, index, child) => {
  if (child.type === Variation) {
    return undefined;
  }
  return new Error(`'${componentName}' should have a children of the type: 'Variation': child.index='${index}', child.type='${child.type}'`);
};


export const validateChildren = (props, propName, componentName) => {
  const children = props[propName];
  // Only accept children of the appropriate type
  const childrenCount = React.Children.count(children);
  switch(childrenCount) {
  case 0:
    return new Error(`'${componentName}' should have at least one child of the type: 'Variation': children.count='${childrenCount}'`);
  case 1:
    return requireChildType(componentName, 0, children);
  default: {
    const errors = React.Children.map( (index, child) => validateChildren(componentName, index, child) ).filter( err => err );
    if (errors.length !== 0) {
      return errors[0];
    }
    return undefined;
  }
  }
};


Experiment.propTypes = {
  // Name of the experiment
  name:       React.PropTypes.string.isRequired,
  // Selector for the experiment
  isEnabled:  React.PropTypes.func.isRequired,
  // React element to render:
  children:   validateChildren,
  // Bound Action Creators
  play:       React.PropTypes.func.isRequired,
  win:        React.PropTypes.func.isRequired,
  activate:   React.PropTypes.func.isRequired,
  deactivate: React.PropTypes.func.isRequired,
};


export const mapStateToProps = ({ reduxAbTest }) => ({ reduxAbTest });
export const mapDispatchToProps = dispatch => bindActionCreators({ play, activate, deactivate }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)((props) => {
  // If not enabled, abort now
  const enabled = props.isEnabled();
  if (!enabled) {
    logger(`Experiment name='${props.name}' is not enabled`);
    return null;
  } else {
    logger(`Experiment name='${props.name}' is enabled`);
    return <Experiment {...props} />;
  }
});
