/** @flow */
import React from "react";
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import Variation from "./variation";
import { ExperimentType, VariationType, actions, selectors } from './module';


type Props = {
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
   * Bound Action Creator: actions.activate(experimentName:string)
   */
  dispatchActivate: Function,
  /**
   * Bound Action Creator: actions.deactivate(experimentName:string)
   */
  dispatchDeactivate: Function,
  /**
  * Bound Action Creator: actions.play(experimentName:string, variationName:string)
   */
  dispatchPlay: Function,
  /**
   * Bound Action Creator: actions.win(experimentName:string, variationName:string)
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


class Experiment extends React.Component {
  props: Props;
  state: State;

  constructor(props, context) {
    super(props, context);
    this.state = {
      variationElements: {},
      variation: null,
      experiment: null
    };
  }

  /**
   * Activate the variation
   */
  componentWillMount() {
    const { name, defaultVariationName, reduxAbTest, dispatchActivate, dispatchPlay, children } = this.props;
    const experiment = selectors.findExperiment({reduxAbTest, experimentName: name});
    const variationElements = mapChildrenToVariationElements(children);
    const variation = selectors.selectVariation({
      experiment,
      defaultVariationName,
      reduxAbTest
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
    const experiment = selectors.findExperiment({reduxAbTest, experimentName: name});
    const variationElements = mapChildrenToVariationElements(children);
    const variation = selectors.selectVariation({
      experiment,
      defaultVariationName,
      reduxAbTest
    });
    this.setState({ variationElements, experiment, variation });
  }

  /**
   * Deactivate the variation from the state
   */
  componentWillUnmount() {
    const { dispatchDeactivate } = this.props;
    const { experiment } = this.state;
    dispatchDeactivate(experiment);
  }

  /**
   * Render one of the variations or `null`
   */
  render() {
    const { experiment, variation, variationElements } = this.state;
    const variationName = variation.get('name');
    const variationElement = variationElements.toJS()[variation.get('name')] || null;
    return variationElement;
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


export const mapStateToProps = (state) => {
  const { reduxAbTest } = state;
  return { reduxAbTest };
}

export const mapDispatchToProps = (dispatch) => {
  return {
    dispatchActivate: bindActionCreators(actions.activate, dispatch),
    dispatchDeactivate: bindActionCreators(actions.deactivate, dispatch),
    dispatchPlay: bindActionCreators(actions.play, dispatch),
    dispatchWin: bindActionCreators(actions.win, dispatch),
  };
};

export const RawExperiment = Experiment;
export default connect(mapStateToProps, mapDispatchToProps)(Experiment);
