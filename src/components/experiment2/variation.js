import React       from 'react';
import { connect } from 'react-redux';
import { logger }  from './logger';


class Variation extends React.Component {
  render() {
    const { name, children } = this.props;
    logger(`${__filename}: Rendering Variation name='${name}'`);
    if (!React.isValidElement(children)) {
      return <span>{children}</span>;
    }
    return children;
  }

  //
  // Component Lifecycle
  //

  componentWillMount() {
    const { name } = this.props;
    logger(`${__filename}: componentWillMount: Variation name='${name}'`);
  }

  componentDidMount() {
    const { name } = this.props;
    logger(`${__filename}: componentDidMount: Variation name='${name}'`);
  }

  componentWillUnmount() {
    const { name } = this.props;
    logger(`${__filename}: componentWillUnmount: Variation name='${name}'`);
  }
}


Variation.propTypes = {
  // Name of your variation
  name:       React.PropTypes.string.isRequired,
  // React element to render:
  children:   React.PropTypes.oneOfType([React.PropTypes.element, React.PropTypes.string]).isRequired,
};


const mapStateToProps = ({ reduxAbTest }) => ({ reduxAbTest });
export default connect(mapStateToProps, null)(Variation);
