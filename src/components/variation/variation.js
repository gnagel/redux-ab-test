/** @flow */
import React from 'react';

type Props = {
  name: string,
  handleWin: ?Function
};

export default class Variation extends React.Component {
  props: Props;

  static defaultProps = {
    name:      'Default Variation Name',
    handleWin: () => {}
  };

  render() {
    const { children, handleWin } = this.props;
    if (!React.isValidElement(children)) {
      return <span handleWin={ handleWin }>{children}</span>;
    }

    // Inject the helper `handleWin` into the child element
    return React.cloneElement(children, { handleWin });
  }
}
