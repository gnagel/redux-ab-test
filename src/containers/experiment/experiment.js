/** @flow */
import React from "react"; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Experiment } from '../../components';
import { registerAdhoc, activate, deactivate, play, win } from '../../module';


/**
 * Map the Redux Store to the Experiment's props
 */
export const mapStateToProps = (state) => {
  const { reduxAbTest } = state;
  return { reduxAbTest };
};


/**
 * Map the action creators to the the Experiment's props.
 */
export const mapDispatchToProps = (dispatch) => {
  return {
    dispatchRegisterAdhoc: bindActionCreators(registerAdhoc, dispatch),
    dispatchActivate:      bindActionCreators(activate, dispatch),
    dispatchDeactivate:    bindActionCreators(deactivate, dispatch),
    dispatchPlay:          bindActionCreators(play, dispatch),
    dispatchWin:           bindActionCreators(win, dispatch)
  };
};


/**
 * Export the new React Container.
 */
export default connect(mapStateToProps, mapDispatchToProps)(Experiment);
