/** @flow */
import React                           from "react"; // eslint-disable-line no-unused-vars
import Immutable                       from 'immutable';
import { createAction, handleActions } from 'redux-actions';
import findExperiment                  from './utils/find-experiment';
import randomVariation                 from './utils/random-variation';
import selectVariation                 from './utils/select-variation';
import createCacheStore                from './utils/create-cache-store';

export const cacheStore = createCacheStore();

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
  WIN: 'redux-ab-test/WIN'
};


export const actions = {
  reset: createAction(constants.RESET, () => Immutable.fromJS({})),
  load: createAction(constants.LOAD, ({experiments, active}) => {
    return Immutable.fromJS({experiments, active});
  }),
  activate: createAction(constants.ACTIVATE, ({experiment}) => {
    return Immutable.fromJS({experiment});
  }),
  deactivate: createAction(constants.DEACTIVATE, ({experiment}) => {
    return Immutable.fromJS({experiment});
  }),
  play: createAction(constants.PLAY, ({experiment, variation}) => {
    return Immutable.fromJS({experiment, variation});
  }),
  win: createAction(constants.WIN, ({experiment, variation}) => {
    return Immutable.fromJS({experiment, variation});
  })
};


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
  [constants.RESET]: (state, { }) => {
    cacheStore.clear();
    return initialState;
  },

  /**
   * LOAD the available experiments. and reset the state of the server
   */
  [constants.LOAD]: (state, { payload }) => {
    return initialState.set('experiments', payload.get('experiments')).set('active', payload.get('active'));
  },

  /**
   * ACTIVATE the available experiments. and reset the state of the server
   */
  [constants.ACTIVATE]: (state, { payload }) => {
    const experimentName = payload.get('experiment').get('name');
    const counter = (state.get('running').get(experimentName) || 0) + 1;
    const running = state.get('running').set(experimentName, counter);
    return state.set('running', running);
  },

  /**
   * DEACTIVATE the available experiments. and reset the state of the server
   */
  [constants.DEACTIVATE]: (state, { payload }) => {
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
  [constants.PLAY]: (state, { payload }) => {
    const experimentName = payload.get('experiment').get('name');
    const variationName = payload.get('variation').get('name');
    const active = state.get('active').set(experimentName, variationName);
    cacheStore().removeItem(experimentName);
    return state.set('active', active);
  },

  /**
   * A user interacted with the variation
   * @payload { experiment:ExperimentType, variation:VariationType }
   */
  [constants.WIN]: (state, { payload }) => {
    const experimentName = payload.get('experiment').get('name');
    const variationName = payload.get('variation').get('name');
    const winners = state.get('winners').set(experimentName, variationName);
    return state.set('winners', winners);
  }
};

export default handleActions(reducers, initialState);



//
// Selectors for querying the Redux/Compoenet state:
//
export const selectors = {
  /**
   * Find the experiment by name, raises an Error if not-found
   */
  findExperiment,
  /**
   * Select a variation from the given input variables
   */
  selectVariation
};
