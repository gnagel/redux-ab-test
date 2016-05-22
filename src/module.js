/** @flow */
import React        from 'react';
import Immutable    from 'immutable';
import { createAction, handleActions } from 'redux-actions';
import crc32 from "fbjs/lib/crc32";


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


export const actions = {
  reset: createAction(constants.RESET, () => Immutable.fromJS({})),
  load: createAction(constants.LOAD, ({experiments, active}) => {
    return Immutable.fromJS({experiments, active})
  }),
  activate: createAction(constants.ACTIVATE, ({experiment}) => {
    return Immutable.fromJS({experiment})
  }),
  deactivate: createAction(constants.DEACTIVATE, ({experiment}) => {
    return Immutable.fromJS({experiment})
  }),
  play: createAction(constants.PLAY, ({experiment, variation}) => {
    return Immutable.fromJS({experiment, variation})
  }),
  win: createAction(constants.WIN, ({experiment, variation}) => {
    return Immutable.fromJS({experiment, variation})
  })
};


export const initialState = Immutable.fromJS({
  experiments: [ /** Array of ExperimentType objects */ ],
  running: { /** "experiment name" => number */ },
  active: { /** "experiment name" => "variation name" */ },
  winners: { /** "experiment name" => "variation name" */ },
});


const reducers = {
  /**
   * RESET the experiments state.
   */
  [constants.RESET]: (state, { type }) => {
    cacheStore().clear();
    return initialState;
  },

  /**
   * LOAD the available experiments. and reset the state of the server
   */
  [constants.LOAD]: (state, { type, payload }) => {
    return initialState.set('experiments', payload.get('experiments')).set('active', payload.get('active'));
  },

  /**
   * ACTIVATE the available experiments. and reset the state of the server
   */
  [constants.ACTIVATE]: (state, { type, payload }) => {
    const experimentName = payload.get('experiment').get('name');
    const counter = (state.get('running').get(experimentName) || 0) + 1;
    const running = state.get('running').set(experimentName, counter);
    return state.set('running', running);
  },

  /**
   * DEACTIVATE the available experiments. and reset the state of the server
   */
  [constants.DEACTIVATE]: (state, { type, payload }) => {
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
  [constants.PLAY]: (state, { type, payload }) => {
    const experimentName = payload.get('experiment').get('name');
    const variationName = payload.get('variation').get('name');
    const active = state.get('active').set(experimentName, variationName);
    return state.set('active', active);
  },

  /**
   * A user interacted with the variation
   * @payload { experiment:ExperimentType, variation:VariationType }
   */
  [constants.WIN]: (state, { type, payload, meta, error }) => {
    const experimentName = payload.get('experiment').get('name');
    const variationName = payload.get('variation').get('name');
    const winners = state.get('winners').set(experimentName, variationName);
    return state.set('winners', winners);
  },
};

export default handleActions(reducers, initialState);



//
// Selectors for querying the Redux/Compoenet state:
//
export const selectors = {
  /**
   * Find the experiment by name, raises an Error if not-found
   */
  findExperiment: ({reduxAbTest, experimentName}) => {
    const experiment = reduxAbTest.get('experiments').find( experiment => experiment.get('name') == experimentName );
    if (!experiment) {
      throw new Error(`The experimentName: '${experimentName}' was not found in experiments=${ reduxAbTest.get('experiments') }`);
    }
    return experiment;
  },
  /**
   * Select a variation from the given input variables
   */
  selectVariation: ({reduxAbTest, experiment, defaultVariationName}) => {
    const experimentName = experiment.get('name');
    // Hash of variation.name => VariationType
    const variationsMap = {};
    experiment.get('variations').forEach( variation => variationsMap[variation.get('name')] = variation );

    // Match against the redux state
    const activeVariationName = reduxAbTest.get('active').get(experimentName);
    if (activeVariationName && variationsMap[activeVariationName]) {
      return variationsMap[activeVariationName];
    }

    // Match against the localstore state.
    // This is used as a in-memory cache to prevent multiple instances of the same experiment from getting differient variations.
    const storeVariationName = cacheStore().getItem('redux-ab-test--' + experimentName);
    if (storeVariationName && variationsMap[storeVariationName]) {
      return variationsMap[storeVariationName];
    }

    // Match against the defaultVariationName
    if (defaultVariationName && variationsMap[defaultVariationName]) {
      return variationsMap[defaultVariationName];
    }

    //
    // Pick a variation ramdomly
    //

    let totalWeights = 0;
    let variationRanges = [];
    experiment.get('variations').filterNot( variation => variation.get('weight') <= 0 ).forEach((variation) => {
      const start = totalWeights;
      const end = totalWeights + variation.get('weight');
      variationRanges.push(Immutable.Range(start, end));
      totalWeights = end;
    });
    const variationWeight = Math.floor(Math.abs(Math.random() * totalWeights));
    const variationIndex = variationRanges.findIndex( range => range.includes(variationWeight) );
    const variation = experiment.get('variations').get(variationIndex) || experiment.get('variations').last();
    cacheStore().setItem('redux-ab-test--' + experimentName, variation.get('name'));

    return variation;
  }
};


//
// Helpers:
//
let cache = {};
const noopStore = {
  cache,
  getItem: (key) => cache[key],
  setItem: (key, value) => { cache[key] = value; },
  removeItem: (key) => { delete cache[key]; },
  clear: () => { cache = {}; }
};

export const cacheStore = () => {
  let store = noopStore;
  if(window && window.localStorage && window.localStorage.setItem) {
    try {
      const key = '__redux-ab-test__';
      window.localStorage.setItem(key, key);
      if (window.localStorage.getItem(key) === key) {
        window.localStorage.removeItem(key);
        store = window.localStorage;
      }
    } catch(e) {
    }
  }
  return store;
};
