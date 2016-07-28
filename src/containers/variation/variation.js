/** @flow */
import React from "react"; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import Variation from '../../components/variation';


/**
 * Map the Redux Store to the Experiment's props
 */
export const mapStateToProps = (state:Object) => {
  const { reduxAbTest } = state;
  return { reduxAbTest };
};


/**
 * Export the new React Container.
 */
export default connect(mapStateToProps)(Variation);
