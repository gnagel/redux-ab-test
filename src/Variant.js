/** @flow */
import React from 'react';

type Props = {
  name: string,
};

export default class Variant extends React.Component {
  props: Props;

  render() {
    const { children } = this.props;
    if (!React.isValidElement(children)) {
      return <span>{children}</span>;
    }
    return children;
  }
}
