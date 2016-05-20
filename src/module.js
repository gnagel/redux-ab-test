/** @flow */
import React        from 'react';
import Immutable    from 'immutable';
import reduxHelpers from 'redux/helpers';

export type VariationType = {
  id: ?string,
  name: string,
  weight: number,
};

export type ExperimentType = {
  id: ?string,
  name: string,
  variations: Array<VariationType>,
};


export const constants = {
  RESET: 'redux-ab-test/RESET',
  LOAD: 'redux-ab-test/LOAD',
  ACTIVATE: 'redux-ab-test/ACTIVATE',
  DEACTIVATE: 'redux-ab-test/DEACTIVATE',
  PLAY: 'redux-ab-test/PLAY',
  WIN: 'redux-ab-test/WIN',
};

const payloadExperiments = (experiments:Array<ExperimentType>) => {
  return Immutable.fromJS({experiments})
};
const payloadExperimentAndVariation = (experiment:ExperimentType, variation:VariationType) => {
  return Immutable.fromJS({experiment, variation})
};

export const actions = {
  reset: reduxHelpers.createAction(constants.RESET),
  load: reduxHelpers.createAction(constants.LOAD, payloadExperiments),
  activate: reduxHelpers.createAction(constants.ACTIVATE, experimentName => experimentName),
  deactivate: reduxHelpers.createAction(constants.DEACTIVATE, payloadExperimentAndVariation),
  play: reduxHelpers.createAction(constants.PLAY, payloadExperimentAndVariation),
  win: reduxHelpers.createAction(constants.WIN, payloadExperimentAndVariation)
};


export const initialState = Immutable.fromJS({
  experiments: {};
  active: { /** "experiment name" => "variation name" */ },
  played: { /** "experiment name" => "variation name" */ },
  winners: { /** "experiment name" => "variation name" */ },
});


export const reducer = reduxHelpers.createReducer(initialState, {
  /**
   * RESET the experiments state.
   */
  [constants.RESET]: (state, {}) => {
    return initialState;
  },

  /**
   * LOAD the available experiments. and reset the state of the server
   */
  [constants.LOAD]: (state, { payload }) => {
    return initialState.set('experiments', payload.get('experiments'));
  },

  /**
   * ACTIVATE the available experiments. and reset the state of the server
   */
  [constants.ACTIVATE]: (state, { payload }) => {
    const { experimentName } = payload;
    const counter = (payload.get('active').get(experimentName) || 0) + 1;
    const active = payload.get('active').set(experimentName, counter);
    return initialState.set('active', active);
  },

  /**
   * DEACTIVATE the available experiments. and reset the state of the server
   */
  [constants.DEACTIVATE]: (state, { payload }) => {
    const { experimentName } = payload;
    const counter = (payload.get('active').get(experimentName) || 0) - 1;
    let active;
    if (counter <= 0) {
      active = payload.get('active').delete(experimentName);
    } else {
      active = payload.get('active').set(experimentName, counter);
    }
    return initialState.set('active', active);
  },

  /**
   * A user saw an experiment
   * @payload { experiment:ExperimentType, variation:VariationType }
   */
  [constants.PLAY]: (state, { payload }) => {
    const experimentName = payload.get('experiment').get('name');
    const variationName = payload.get('variation').get('name');
    const active = state.get('active').set(experimentName, variationName);
    return state.set('active', active);
  },

  /**
   * A user interacted with the variation
   * @payload { experiment:ExperimentType, variation:VariationType }
   */
  [constants.WIN]: (state, { payload, meta, error }) => {
    const experimentName = payload.get('experiment').get('name');
    const variationName = payload.get('variation').get('name');
    const winners = state.get('winners').set(experimentName, variationName);
    return state.set('winners', winners);
  },
});


//
// Helpers:
//

// Helper to record an event occured
export const recordEvent = (eventName, experimentName, variationName) => {
  ana.trackEvent(false, eventName, { Experiment: experimentName, Variation: variationName });
}
