/** @flow */
import React from "react";
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ExperimentType, VariationType, actions, selectors } from './module';

type WrapsExperimentType = {
  experiment: ExperimentType
};
type WrapsExperimentVariationType = {
  experiment: ExperimentType,
  variation: VariationType
};
function recievesExperiment(opts:WrapsExperimentType) {}
function recievesExperimentVariation(opts:WrapsExperimentVariationType) {}

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
   * Optional Callback, occurs after the Bound Action Creator is called
   */
  onActivate: ?recievesExperiment,
  /**
   * Optional Callback, occurs after the Bound Action Creator is called
   */
  onDeactivate: ?recievesExperiment,
  /**
   * Optional Callback, occurs after the Bound Action Creator is called
   */
  onPlay: ?recievesExperimentVariation,
  /**
   * Optional Callback, occurs after the Bound Action Creator is called
   */
  onWin: ?recievesExperimentVariation,

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
    const onActivate = (this.props.onActivate || recievesExperiment);
    const onPlay = (this.props.onPlay || recievesExperimentVariation);
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
    // Trigger the callbacks (if any were supplied)
    onActivate({experiment});
    onPlay({experiment, variation});
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
    const onDeactivate = (this.props.onDeactivate || recievesExperiment);
    // Dispatch the deactivation event
    dispatchDeactivate({experiment})
    // Trigger the callbacks (if any were supplied)
    onDeactivate({experiment});
  }


  handleWin() {
    const { dispatchWin, onWin } = this.props;
    const { experiment, variation } = this.state;

    dispatchWin({experiment, variation});
    (this.props.onWin || recievesExperimentVariation)({experiment, variation});
  }


  /**
   * Render one of the variations or `null`
   */
  render() {
    const { variation, variationElements } = this.state;
    const variationName = variation.get('name');
    const child = variationElements.toJS()[variationName];
    if (!child) {
      return null;
    }

    // Inject the helper `handleWin` into the child element
    return React.cloneElement(child, { handleWin: this.handleWin.bind(this) });
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
};

export const mapDispatchToProps = (dispatch) => {
  return {
    dispatchActivate: bindActionCreators(actions.activate, dispatch),
    dispatchDeactivate: bindActionCreators(actions.deactivate, dispatch),
    dispatchPlay: bindActionCreators(actions.play, dispatch),
    dispatchWin: bindActionCreators(actions.win, dispatch)
  };
};

export const RawExperiment = Experiment;
export default connect(mapStateToProps, mapDispatchToProps)(Experiment);
