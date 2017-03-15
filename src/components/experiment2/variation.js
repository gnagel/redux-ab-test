import React                  from 'react';
import { connect }            from 'react-redux';


class Variation extends React.Component {
  render() {
    const { children } = this.props;
    return children;
  }
}


Variation.propTypes = {
  // Name of your variation
  name:       React.PropTypes.string.isRequired,
  // React element to render:
  children:   React.PropTypes.node.isRequired,
};


const mapStateToProps = ({ reduxAbTest }) => ({ reduxAbTest });
export default connect(mapStateToProps, null)(Variation);
