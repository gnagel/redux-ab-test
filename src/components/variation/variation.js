/** @flow */
import React       from 'react';
import Immutable   from 'immutable';
import { connect } from 'react-redux';
import { logger } from '../../utils/logger';


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
export class Variation extends React.Component {
  props: Props;
  static defaultProps = {
    id:          null,
    name:        null,
    variation:   null,
    experiment:  Immutable.Map({}),
    reduxAbTest: Immutable.Map({}),
  };

  render() {
    const { reduxAbTest, experiment, id, name, children } = this.props;
    const variation       = this.props.variation || experiment.get('variations').find( variation => (variation.get('id') === id || variation.get('name') === name) ) || Immutable.Map();
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

    logger(`${__filename} Variation rendered experiment.name='${experiment.get('name')}', variation.name='${variation.get('name')}'`);

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


// Map the Redux Store to the Experiment's props
export const mapStateToProps = ({ reduxAbTest }) => ({ reduxAbTest });
// Export the new React Container.
export default connect(mapStateToProps)(Variation);
