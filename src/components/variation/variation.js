/** @flow */
import React from 'react';
import Immutable from 'immutable';

type Props = {
  id:         string,
  name:       string,
  experiment: Immutable.Map,
  handleWin:  Function,
};

export default class Variation extends React.Component {
  props: Props;
  static defaultProps = {
    id:         null,
    name:       null,
    experiment: Immutable.Map({}),
    handleWin:  () => {}
  };

  render() {
    const { id, name, experiment, handleWin, children } = this.props;

    const childrenProps = {
      'data-experiment-id':   experiment.get('id'),
      'data-experiment-name': experiment.get('name'),
      'data-variation-id':    id,
      'data-variation-name':  name,
    };

    // This is text or null content, wrap it in a span and return the contents
    if (!React.isValidElement(children)) {
      return (
        <span
          data-experiment-id={experiment.get('id')}
          data-experiment-name={experiment.get('name')}
          data-variation-id={id}
          data-variation-name={name}>
          {children}
        </span>
      );
    }

    // Inject the experiment/variation props into the children
    return React.cloneElement(children, {
      variationId:    id,
      variationName:  name,
      experimentId:   experiment.get('id'),
      experimentName: experiment.get('name'),
      handleWin
    });
  }
}
