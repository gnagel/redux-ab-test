/** @flow */
import React          from 'react';
import Immutable      from 'immutable';

type Props = {
  /**
   * Contents of the Variation to render
   */
  children: any,
  /**
   * ID of the Variation
   */
  id: ?string,
  /**
   * Variation's name
   */
  name:       string,
  /**
   * Variation instance, provided by the Experiment parent component
   */
  variation: Immutable.Map,
  /**
   * Experiment instance, provided by the Experiment parent component
   */
  experiment: Immutable.Map,
  /**
   * Action Creator callback: Function({experiment:ExperimentType, variation:VariationType})
   */
  dispatchWin: Function,
  /**
   * Optional: Add the prop `dispatchWin({ actionType, actionPayload })` to the rendered component.
   * The experiment & variation are automatically bound for you.
   */
  bindDispatchWin: ?bool,
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
    id:              null,
    name:            null,
    variation:       null,
    experiment:      Immutable.Map({}),
    reduxAbTest:     Immutable.Map({}),
    dispatchWin:     () => {},
    bindDispatchWin: false,
  };

  render() {
    const { reduxAbTest, experiment, dispatchWin, bindDispatchWin, id, name, children } = this.props;
    const variation       = this.props.variation || experiment.get('variations').find( variation => (variation.get('id') === id || variation.get('name') === name) );
    const experimentProps = experiment.getIn( reduxAbTest.get('props_path'), Immutable.Map({})).toJS();
    const variationProps  = variation.getIn(  reduxAbTest.get('props_path'), Immutable.Map({})).toJS();

    // Generate the data* props to pass to the children
    const additionalProps = {
      ...experimentProps,
      ...variationProps,
      'data-experiment-id':   experiment.get('id'),
      'data-experiment-name': experiment.get('name'),
      'data-variation-id':    variation.get('id'),
      'data-variation-name':  variation.get('name'),
    };
    // Bind the optional `dispatchWin` prop
    if (bindDispatchWin) {
      additionalProps['dispatchWin'] = ({actionType, actionPayload}) => dispatchWin({ experiment, variation, actionType, actionPayload });
    }

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
