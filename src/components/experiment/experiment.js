/** @flow */
import React from "react";
import Immutable from 'immutable';
import findExperiment from '../../utils/find-experiment';
import selectVariation from '../../utils/select-variation';
import { cacheStore } from '../../utils/create-cache-store';

type Props = {
  /**
   * Redux State:
   * ```js
   *   reduxAbTest = {
   *     experiments: [],
   *     active: {
   *       "experiment.name" => "variation.name",
   *       ...
   *     }
   *     ...
   *   }
   * ```
   */
  reduxAbTest: Immutable.Map,
  /**
   * Name of the experiment
   */
  name: string,
  /**
   * Name of the default variation.
   * >  When defined, this value is used to choose a variation if a stored value is not present.
   * >  This property may be useful for server side rendering but is otherwise not recommended.
   */
  defaultVariationName: ?string,
  /**
   * Action Creator callback: Function({experiment:ExperimentType})
   */
  dispatchActivate: Function,
  /**
   * Action Creator callback: Function({experiment:ExperimentType})
   */
  dispatchDeactivate: Function,
  /**
   * Action Creator callback: Function({experiment:ExperimentType, variation:VariationType})
   */
  dispatchPlay: Function,
  /**
   * Action Creator callback: Function({experiment:ExperimentType, variation:VariationType})
   */
  dispatchWin: Function,
};


type State = {
  /**
   * Hash of "name" => Variation element
   */
  variationElements: Object,
  /**
   * The currenly active experiment
   */
  experiment: ?ExperimentType,
  /**
   * The currenly active variation
   */
  variation: ?VariationType,
};


export default class Experiment extends React.Component {
  props: Props;
  state: State;
  static defaultProps = {
    reduxAbTest:          Immutable.Map({ experiments: [], active: {} }),
    name:                 'Default Experiment Name',
    defaultVariationName: null,
    dispatchActivate:     () => {},
    dispatchDeactivate:   () => {},
    dispatchPlay:         () => {},
    dispatchWin:          () => {},
  };
  state = {
    variationElements: {},
    variation:         null,
    experiment:        null
  };


  /**
   * Activate the variation
   */
  componentWillMount() {
    const { name, defaultVariationName, reduxAbTest, dispatchActivate, dispatchPlay, children } = this.props;
    const experiment = findExperiment(reduxAbTest, name);
    const variationElements = mapChildrenToVariationElements(children);
    const variation = selectVariation({
      reduxAbTest,
      experiment,
      defaultVariationName,
      cacheStore
    });

    // These will trigger `componentWillReceiveProps`
    dispatchActivate({experiment});
    dispatchPlay({experiment, variation});
    this.setState({ variationElements, experiment, variation });
  }


  /**
   * Update the component's state with the new properties
   */
  componentWillReceiveProps(nextProps) {
    const { name, defaultVariationName, reduxAbTest, children } = nextProps;
    const experiment = findExperiment(reduxAbTest, name);
    const variationElements = mapChildrenToVariationElements(children);
    const variation = selectVariation({
      reduxAbTest,
      experiment,
      defaultVariationName,
      cacheStore
    });
    this.setState({ variationElements, experiment, variation });
  }


  /**
   * Deactivate the variation from the state
   */
  componentWillUnmount() {
    const { dispatchDeactivate } = this.props;
    const { experiment } = this.state;
    // Dispatch the deactivation event
    dispatchDeactivate({experiment});
  }


  /**
   * Notify the client of the `WIN` event
   */
  _handleWin = () => {
    const { dispatchWin } = this.props;
    const { experiment, variation } = this.state;
    dispatchWin({experiment, variation});
  }


  /**
   * Render one of the variations or `null`
   */
  render() {
    const { name } = this.props;
    const { variation, variationElements } = this.state;
    const variationName = variation.get('name');
    const variationChildElement = variationElements.toJS()[variationName];
    if (!variationChildElement) {
      return null;
    }

    // Inject the helper `handleWin` into the child element
    return React.cloneElement(variationChildElement, { experimentName: name });
  }
}


/**
 * Helper function: Convert `children` to a hash of { `name` => variation }
 */
const mapChildrenToVariationElements = (children) => {
  const variationElements = {};
  React.Children.forEach(children, element => variationElements[element.props.name] = element);
  return Immutable.fromJS(variationElements);
};
