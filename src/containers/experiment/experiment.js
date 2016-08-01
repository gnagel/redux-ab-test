/** @flow */
import React from "react"; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Experiment from '../../components/experiment';
import { activate, deactivate, play, win } from '../../module';


/**
 * Map the Redux Store to the Experiment's props
 */
export const mapStateToProps = (state:Object) => {
  const { reduxAbTest } = state;
  return { reduxAbTest };
};


/**
 * Map the action creators to the the Experiment's props.
 */
export const mapDispatchToProps = (dispatch:Function) => bindActionCreators(
  {
    dispatchActivate:      activate,
    dispatchDeactivate:    deactivate,
    dispatchPlay:          play,
    dispatchWin:           win,
  },
  dispatch
);


/**
 * Export the new React Container.
 */
export default connect(mapStateToProps, mapDispatchToProps)(Experiment);
