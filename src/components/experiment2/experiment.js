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


class Experiment extends React.Component {
  state = {
    experiment: null,
    variation:  null,
  };

  render() {
    const { children } = this.props;

    // Group the children by name
    const childrenByName = {};
    if (React.Children.count(children) === 0) {
      childrenByName[ children.props.name ] = children;
    } else {
      React.Children.map(child => {
        child[child.props.name] = child;
      });
    }

    // Find the child by name
    const variation = this.variation();
    if (variation) {
      return childrenByName[variation.get('name')] || null;
    }
    return null;
  }

  //
  // Helpers:
  //

  byName = () => {
    const { reduxAbTest } = this.props;
    const experiments = reduxAbTest.getIn(['experiments'], Immutable.List());
    const byName = {};
    experiments.forEach(e => {
      byName[e.get('name', '').toLowerCase()] = e;
    });
    return byName;
  };

  experiment = () => {
    return this.byName(this.props.name);
  };

  variation = () => {
    const e = this.experiment();
    if (!e) {
      return null;
    }
    // TODO: return variation
    return null;
  };

  //
  // Component Lifecycle
  //

  // Activate the variation
  componentWillMount() {
    const { play } = this.props;
    const experiment = this.experiment();
    const variation = this.variation();

    if (play && experiment && variation) {
      play({ experiment, variation });
    }
    this.setState({ experiment, variation });
  }

  // Activate the variation
  componentDidMount() {
    const { activate } = this.props;
    const experiment = this.experiment();
    if (activate && experiment) {
      activate({ experiment });
    }
  }

  // Dispatch the deactivation event
  componentWillUnmount() {
    const { deactivate } = this.props;
    const experiment = this.experiment();
    if (deactivate && experiment) {
      deactivate({ experiment });
    }
  }
}


export const requireChildType = (componentName, index, child) => {
  if (child.type === Variation) {
    return undefined;
  }
  return new Error(`'${componentName}' should have a children of the type: 'Variation': child.index=${index}, child.type=${child.type}`);
};


export const validateChildren = (props, propName, componentName) => {
  const children = props[propName];
  // Only accept children of the appropriate type
  const childrenCount = React.Children.count(children);
  switch(childrenCount) {
  case 0:
    return new Error(`'${componentName}' should have at least one child of the type: 'Variation': children.count=${childrenCount}`);
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
    return null;
  } else {
    return <Experiment {...props} />;
  }
});
