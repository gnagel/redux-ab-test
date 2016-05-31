/** @flow */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';

import { Debugger } from '../../components';
import { actions } from '../../module';


/**
 * Map the Redux Store to the Experiment's props
 */
export const mapStateToProps = (state) => {
  const { reduxAbTest } = state;
  const disabled = process.env.NODE_ENV === "production" || !canUseDOM;
  return { reduxAbTest, disabled };
};


/**
 * Map the action creators to the the Experiment's props.
 */
export const mapDispatchToProps = (dispatch) => {
  return {
    dispatchRegisterAdhoc: bindActionCreators(actions.registerAdhoc, dispatch),
    dispatchActivate: bindActionCreators(actions.activate, dispatch),
    dispatchDeactivate: bindActionCreators(actions.deactivate, dispatch),
    dispatchPlay: bindActionCreators(actions.play, dispatch),
    dispatchWin: bindActionCreators(actions.win, dispatch)
  };
};


/**
 * Export the new React Container.
 */
export default connect(mapStateToProps, mapDispatchToProps)(Debugger);
