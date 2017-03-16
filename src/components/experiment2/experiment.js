import React                  from 'react';
import { connect }            from 'react-redux';
import ImmutablePropTypes     from 'react-immutable-proptypes';
import selectVariation        from '../../utils/select-variation';
import { logger }             from './logger';
import LoadedComponent        from './loaded-component';
import {
  groupChildrenByName,
  groupExperimentsByName,
  requireChildrenAreVariations,
}                             from './selectors';


class Experiment extends React.Component {
  static propTypes = {
    // Name of the experiment
    name:                 React.PropTypes.string.isRequired,
    defaultVariationName: React.PropTypes.string.isRequired,
    // Selector for the experiment
    isEnabled:            React.PropTypes.func.isRequired,
    // React element to render:
    children:             requireChildrenAreVariations,
    // Optional selectors for additional control
    isLoading:            React.PropTypes.func,
    forceRender:          React.PropTypes.bool,
    // Optional components for loading state:
    getLoadingState:      React.ProptTypes.func,
    getDisabledState:     React.ProptTypes.func,
    //
    // Redux store props:
    //
    experimentsByName:     React.PropTypes.object.isRequired,
    reduxAbTest:           ImmutablePropTypes.map.isRequired,
  };
  static defaultProps = {
    isLoading:         () => false,
    getLoadingState:   null,
    getDisabledState:  null,
    forceRender:       false,
  };

  render() {
    const { name, defaultVariationName, isEnabled, isLoading, experimentsByName, reduxAbTest, children } = this.props;
    const enabled        = isEnabled();
    const loading        = isLoading();
    const childrenByName = groupChildrenByName(children);
    logger(`${__filename}: Rendering Experiment name='${name}', enabled='${enabled}', loading='${loading}', children.names=${Object.keys(childrenByName)}`);

    // The default output is default variation's children,
    // when the experiment is disabled / loading / invalid.
    const defaultOutput  = childrenByName[defaultVariationName] && childrenByName[defaultVariationName].children;

    //
    // Render the disabled / loading states
    //
    if (!enabled) {
      logger(`${__filename}: Experiment name='${name}' is disabled`);
      const { getDisabledState } = this.props;
      if (getDisabledState) {
        return getDisabledState();
      }
      return <span>{defaultOutput}</span>;
    }
    if (loading) {
      logger(`${__filename}: Experiment name='${name}' is loading`);
      const { getLoadingState } = this.props;
      if (getLoadingState) {
        return getLoadingState();
      }
      return <span>{defaultOutput}</span>;
    }

    //
    // Get the experiment && variation from the input props:
    //
    let experiment = null;
    let variation  = null;
    experiment = experimentsByName[name];
    variation = experiment && selectVariation({
      experiment:           experiment,
      active:               reduxAbTest.get('active'),
      defaultVariationName: defaultVariationName,
    });
    if (!experiment && forceRender) {
      // Force the experiment object into existance to allow the component to render
      // This should be used for ad-hock experiment
      logger(`${__filename}: Experiment name='${name}' is forced to render`);
      experiment = Immutable.Map({ name });
      variation  = Immutable.Map({ name: defaultVariationName });
    }
    if (!experiment) {
      logger(`${__filename}: Experiment name='${name}' is enabled, but not in the store`);
      return <span>{defaultOutput}</span>;
    }
    if (!variation) {
      logger(`${__filename}: Experiment name='${name}' is enabled, but no variation is available`);
      return <span>{defaultOutput}</span>;
    }
    const variationName = variation.get('name', '');

    // Valdiate the variation selected exists
    if (!childrenByName[variationName]) {
      logger(`${__filename}: Experiment name='${name}' has no child with the name='${variationName}'`);
      return <span>{defaultOutput}</span>;
    }

    //
    // Render the component wrapper with the attached experiment
    //

    logger(`${__filename}: Experiment name='${name}' is enabled`);
    return (
      <LoadedComponent
        experimentName={name}
        variationName={variationName}
        experiment={experiment}
        variation={variation}
        >
        {children}
      </LoadedComponent>
    );
  }
}

export const mapStateToProps = (state) => ({
  reduxAbTest: state,
  experimentsByName: groupExperimentsByName(state),
});
export default connect(mapStateToProps)(Experiment);
