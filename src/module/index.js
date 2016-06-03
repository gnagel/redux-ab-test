/** @flow */
import React                             from "react"; // eslint-disable-line no-unused-vars
import Immutable                         from 'immutable';
import { createAction, handleActions }   from 'redux-actions';
import findExperiment                    from '../utils/find-experiment';
import { cacheStore }                    from '../utils/create-cache-store';
import winningActionTypes                from '../utils/experiment-action-types';
import generateWinActions                from '../utils/generate-win-actions';
import { immutableExperiment, immutableExperimentVariation } from '../utils/wraps-immutable';

//
// Redux Action Types
//
export const RESET = 'redux-ab-test/RESET';
export const LOAD = 'redux-ab-test/LOAD';
export const ACTIVATE = 'redux-ab-test/ACTIVATE';
export const DEACTIVATE = 'redux-ab-test/DEACTIVATE';
export const PLAY = 'redux-ab-test/PLAY';
export const WIN = 'redux-ab-test/WIN';
export const REGISTER_ADHOC = 'redux-ab-test/REGISTER_ADHOC';


//
// Redux Action Creators:
//
export const reset = createAction(RESET,                   () => Immutable.fromJS({}));
export const load = createAction(LOAD,                     ({experiments, active}) => Immutable.fromJS({experiments, active}) );
export const activate = createAction(ACTIVATE,              immutableExperiment );
export const deactivate = createAction(DEACTIVATE,          immutableExperiment );
export const play = createAction(PLAY,                     immutableExperimentVariation );
export const win = createAction(WIN,                       ({experiment, variation, actionType, actionPayload}) => Immutable.fromJS({experiment, variation, actionType, actionPayload}) );
// Non-standard actions
export const registerAdhoc = createAction(REGISTER_ADHOC,   immutableExperiment );


export const initialState = Immutable.fromJS({
  experiments: [ /** Array of ExperimentType objects */ ],
  running: { /** "experiment name" => number */ },
  active: { /** "experiment name" => "variation name" */ },
  winners: { /** "experiment name" => "variation name" */ },

  winActionTypes: { /** Array of Redux Action Types */ },
  winActionsQueue: [ /** Array of Redux Action Types */ ],
});


export const middleware = store => next => action => {
  // Process the input action
  const output = next(action);

  // Multi-plex the action output if we are listening for any wins
  const reduxAbTest = store.getState().reduxAbTest;
  if (reduxAbTest) {
    const actions = generateWinActions({
      reduxAbTest,
      next,
      win,
      actionType: action.type,
      actionPayload: action.payload
    });
    actions.forEach( action => next(action) );
  }

  // Return the original action's output
  return output;
};


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
    return initialState.merge({
      experiments: payload.get('experiments'),
      active: payload.get('active'),
      winActionTypes: winningActionTypes(payload.get('experiments'))
    });
  },


  /**
   * An Ad-Hoc Experiment was seen.  This dynamically creates a new experiment, ignoring duplicates when necessary.
   */
  [REGISTER_ADHOC]: (state, { payload }) => {
    const experiment = payload.get('experiment');
    const experimentNames = state.get('experiments').map( i => i.get('name') );
    if (experimentNames.includes(experiment.get('name'))) {
      // Ignore duplicate register events
      // ex: seeing an adhoc experiment multiple times by switching between pages
      return state;
    }
    const experiments = state.get('experiments').push(experiment);
    const winActionTypes = winningActionTypes(experiments);
    return state.merge({
      experiments,
      winActionTypes
    });
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
  },
};

export default handleActions(reducers, initialState);
