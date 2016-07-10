/** @flow */
import React                             from "react"; // eslint-disable-line no-unused-vars
import Immutable                         from 'immutable';
import { createAction, handleActions }   from 'redux-actions';
import { cacheStore }                    from '../utils/create-cache-store';
import toWinningActionTypes              from '../utils/experiment-action-types';
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
export const load = createAction(LOAD,                     ({experiments, active, types_path}) => Immutable.fromJS({experiments, active, types_path}) );
export const activate = createAction(ACTIVATE,              immutableExperiment );
export const deactivate = createAction(DEACTIVATE,          immutableExperiment );
export const play = createAction(PLAY,                     immutableExperimentVariation );
export const win = createAction(WIN,                       ({experiment, variation, actionType, actionPayload}) => Immutable.fromJS({experiment, variation, actionType, actionPayload}) );
// Non-standard actions
export const registerAdhoc = createAction(REGISTER_ADHOC,   immutableExperiment );


export const initialState = Immutable.fromJS({
  experiments:      [ /** Array of ExperimentType objects */ ],
  running:          { /** "experiment name" => number */ },
  active:           { /** "experiment name" => "variation name" */ },
  winners:          { /** "experiment name" => "variation name" */ },
  types_path:       ['win_action_types'],
  win_action_types: { /** Array of Redux Action Types */ },
});


export const middleware = store => next => action => {
  // Process the input action
  const output = next(action);

  // Multi-plex the action output if we are listening for any wins
  const reduxAbTest = store.getState().reduxAbTest;
  if (reduxAbTest) {
    const actions = generateWinActions({
      reduxAbTest,
      win,
      actionType:    action.type,
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
    let types_path = payload.get('types_path');
    if (payload.get('types_path') === undefined) {
      types_path = state.get('types_path');
    } else {
      types_path = Immutable.fromJS([payload.get('types_path')]).flatten();
    }
    return initialState.merge({
      experiments:      payload.get('experiments'),
      active:           payload.get('active'),
      types_path,
      win_action_types: toWinningActionTypes({experiments: payload.get('experiments'), path: types_path})
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
    const win_action_types = toWinningActionTypes({experiments, path: state.get('types_path')});
    return state.merge({
      experiments,
      win_action_types
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
