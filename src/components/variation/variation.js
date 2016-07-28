/** @flow */
import React from 'react';
import Immutable from 'immutable';

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

/**
 * Variation component
 * - A single variation will be chosen by the parent component: Experiment.
 * - The children can be any JSX component, including plain text.
 * - The child component will recieve 4x data-* attributes with the `id` and `name` of the experiment & variation.
 */
export default class Variation extends React.Component {
  props: Props;
  static defaultProps = {
    name:           null,
    experimentName: null,
    reduxAbTest:    Immutable.Map({}),
  };

  render() {
    const { reduxAbTest, experimentName } = this.props;
    const variationName = this.props.name;
    let { children } = this.props;

    // Lookup the experiment and variation
    const experiment = reduxAbTest.get('experiments').find( experiment => (experiment.get('name') === experimentName) ) || Immutable.Map({});
    const variation = experiment.get('variations').find( variation => (variation.get('name') === variationName) ) || Immutable.Map({});

    // Generate the data* props to pass to the children
    const childrenProps = {
      'data-experiment-id':   experiment.get('id'),
      'data-experiment-name': experiment.get('name'),
      'data-variation-id':    variation.get('id'),
      'data-variation-name':  variation.get('name'),
    };

    // This is text or null content, wrap it in a span and return the contents
    if (!React.isValidElement(children)) {
      children = (<span>{children}</span>);
    }

    // Inject the experiment/variation props into the children
    return React.cloneElement(children, childrenProps);
  }
}
