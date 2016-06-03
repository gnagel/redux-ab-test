/** @flow */
import React                             from "react"; // eslint-disable-line no-unused-vars
import Immutable                         from 'immutable';
import { createAction, handleActions }   from 'redux-actions';
import findExperiment                    from '../utils/find-experiment';
import { cacheStore }                    from '../utils/create-cache-store';
import { immutableExperiment, immutableExperimentVariation } from '../utils/wraps-immutable';

//
// Redux Action Types
//
export const RESET = 'redux-ab-test/RESET';
export const LOAD = 'redux-ab-test/LOAD';
export const REGISTER_ADHOC = 'redux-ab-test/REGISTER_ADHOC';
export const ACTIVATE = 'redux-ab-test/ACTIVATE';
export const DEACTIVATE = 'redux-ab-test/DEACTIVATE';
export const PLAY = 'redux-ab-test/PLAY';
export const WIN = 'redux-ab-test/WIN';


//
// Redux Action Creators:
//
export const reset = createAction(RESET,                   () => Immutable.fromJS({}));
export const load = createAction(LOAD,                     ({experiments, active}) => Immutable.fromJS({experiments, active}) );
export const activate = createAction(ACTIVATE,              immutableExperiment );
export const registerAdhoc = createAction(REGISTER_ADHOC,   immutableExperiment );
export const deactivate = createAction(DEACTIVATE,          immutableExperiment );
export const play = createAction(PLAY,                     immutableExperimentVariation );
export const win = createAction(WIN,                       immutableExperimentVariation );


export const initialState = Immutable.fromJS({
  experiments: [ /** Array of ExperimentType objects */ ],
  running: { /** "experiment name" => number */ },
  active: { /** "experiment name" => "variation name" */ },
  winners: { /** "experiment name" => "variation name" */ }
});


const reducers = {
  /**
   * RESET the experiments state.
   */
  [RESET]: (state, { }) => {
    cacheStore.clear();
    return initialState;
  },

  /**
   * LOAD the available experiments. and reset the state of the server
   */
  [LOAD]: (state, { payload }) => {
    return initialState.set('experiments', payload.get('experiments')).set('active', payload.get('active'));
  },

  /**
   * ACTIVATE the available experiments. and reset the state of the server
   */
  [ACTIVATE]: (state, { payload }) => {
    const experimentName = payload.get('experiment').get('name');
    const counter = (state.get('running').get(experimentName) || 0) + 1;
    const running = state.get('running').set(experimentName, counter);
    return state.set('running', running);
  },

  /**
   * DEACTIVATE the available experiments. and reset the state of the server
   */
  [DEACTIVATE]: (state, { payload }) => {
    const experimentName = payload.get('experiment').get('name');
    const counter = (state.get('running').get(experimentName) || 0) - 1;
    let running;
    if (counter <= 0) {
      running = state.get('running').delete(experimentName);
    } else {
      running = state.get('running').set(experimentName, counter);
    }
    return state.set('running', running);
  },

  /**
   * A user saw an experiment
   * @payload { experiment:ExperimentType, variation:VariationType }
   */
  [PLAY]: (state, { payload }) => {
    const experimentName = payload.get('experiment').get('name');
    const variationName = payload.get('variation').get('name');
    const active = state.get('active').set(experimentName, variationName);
    cacheStore.removeItem(experimentName);
    return state.set('active', active);
  },

  /**
   * A user interacted with the variation
   * @payload { experiment:ExperimentType, variation:VariationType }
   */
  [WIN]: (state, { payload }) => {
    const experimentName = payload.get('experiment').get('name');
    const variationName = payload.get('variation').get('name');
    const winners = state.get('winners').set(experimentName, variationName);
    return state.set('winners', winners);
  }
};

export default handleActions(reducers, initialState);
