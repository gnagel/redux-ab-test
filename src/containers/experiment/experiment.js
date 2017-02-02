/** @flow */
import React from "react"; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import getKey from '../../utils/get-key';
import selectVariation from '../../utils/select-variation';
import { cacheStore } from '../../utils/create-cache-store';

import Experiment from '../../components/experiment';
import { activate, deactivate, play, win } from '../../module';

const getExperiment = (reduxAbTest, selector, id, name) => {
  // Find the key of the currently available experiment
  const key = reduxAbTest.getIn(['availableExperiments', selector || id || name], null);
  // console.log(`key=${key}, selector=${selector} || id=${id} || name=${name}`)
  if (!key) {
    return null;
  }
  // Select the experiment from the redux store
  const experiment = reduxAbTest.get('experiments').find(experiment => (getKey(experiment) === key), null);
  // console.log(`key=${key}, selector=${selector} || id=${id} || name=${name} => experiment=${experiment}`)
  // Return the resulting experiment
  return experiment;
}


/**
 * Map the Redux Store to the Experiment's props
 */
export const mapStateToProps = (state:Object, ownProps:Object) => {
  const { reduxAbTest } = state;
  const { selector, id, name, defaultVariationName } = ownProps;
  const experiment = getExperiment(reduxAbTest, selector, id, name);

  let variation = null;
  if (experiment) {
    variation = selectVariation({
      active: reduxAbTest.get('active'),
      experiment,
      defaultVariationName,
      cacheStore
    });
  }

  return { reduxAbTest, experiment, variation };
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
