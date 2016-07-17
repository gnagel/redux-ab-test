/** @flow */
import React from "react"; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';

import Debugger from '../../components/debugger';
import { registerAdhoc, activate, deactivate, play, win } from '../../module';


/**
 * Map the Redux Store to the Experiment's props
 */
export const mapStateToProps = (state:Object) => {
  const { reduxAbTest } = state;
  const disabled = process.env.NODE_ENV === "production" || !canUseDOM;
  return { reduxAbTest, disabled };
};


/**
 * Map the action creators to the the Experiment's props.
 */
export const mapDispatchToProps = (dispatch:Function) => bindActionCreators({
  dispatchRegisterAdhoc: registerAdhoc,
  dispatchActivate:      activate,
  dispatchDeactivate:    deactivate,
  dispatchPlay:          play,
  dispatchWin:           win,
}, dispatch);


/**
 * Export the new React Container.
 */
export default connect(mapStateToProps, mapDispatchToProps)(Debugger);
