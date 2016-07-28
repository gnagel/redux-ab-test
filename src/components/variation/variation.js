/** @flow */
import React          from 'react';
import Immutable      from 'immutable';
import findExperiment from '../../utils/find-experiment';
import findVariation  from '../../utils/find-variation';

type Props = {
  /**
   * Contents of the Variation to render
   */
  children: any,
  /**
   * Variation's name
   */
  name:       string,
  /**
   * Experiment name, provided by the Experiment parent component
   */
  experimentName: string,
  /**
   * Redux store
   */
  reduxAbTest: Immutable.Map,
};

type State = {
  experiment: ?Immutable.Map,
  variation:  ?Immutable.Map,
};

/**
 * Variation component
 * - A single variation will be chosen by the parent component: Experiment.
 * - The children can be any JSX component, including plain text.
 * - The child component will recieve 4x data-* attributes with the `id` and `name` of the experiment & variation.
 */
export default class Variation extends React.Component {
  props: Props;
  state: State;
  static defaultProps = {
    name:           null,
    experimentName: null,
    reduxAbTest:    Immutable.Map({}),
  };
  state = { experiment: null, variation: null };

  /**
   * Record the experiment and variation
   */
  componentWillMount() {
    const { experimentName, name, reduxAbTest } = this.props;
    // Lookup the experiment and variation
    const experiment = findExperiment(reduxAbTest, experimentName);
    const variation = findVariation(experiment, name);
    // Save the experiment & variation in the state
    this.setState({ experiment, variation });
  }

  /**
   * If the experiment or variation has changed, then update the state
   */
  componentWillReceiveProps(nextProps) {
    const { experimentName, name, reduxAbTest } = nextProps;
    // Lookup the experiment and variation
    const experiment = findExperiment(reduxAbTest, experimentName);
    const variation = findVariation(experiment, name);
    const lastExperiment = this.state.experiment;
    const lastVariation = this.state.variation;

    // Compare the current and last states
    if (experiment.equals(lastExperiment) && variation.equals(lastVariation)) {
      return;
    }

    // The experiment or variation has changed, update the state
    this.setState({ experiment, variation });
  }


  render() {
    const { children } = this.props;
    const { experiment, variation } = this.state;

    const experimentProps = experiment.get('componentProps', Immutable.Map({})).toJS();
    const variationProps = variation.get('componentProps', Immutable.Map({})).toJS();

    // Generate the data* props to pass to the children
    const additionalProps = {
      ...experimentProps,
      ...variationProps,
      'data-experiment-id':   experiment.get('id'),
      'data-experiment-name': experiment.get('name'),
      'data-variation-id':    variation.get('id'),
      'data-variation-name':  variation.get('name'),
    };

    // This is text or null content, wrap it in a span and return the contents
    if (!React.isValidElement(children)) {
      return (
        <span {...additionalProps} >{children}</span>
      );
    }

    // Inject the experiment/variation props into the children
    return React.cloneElement(children, additionalProps);
  }
}
