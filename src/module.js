/** @flow */
import React                           from "react"; // eslint-disable-line no-unused-vars
import Immutable                       from 'immutable';
import { createAction, handleActions } from 'redux-actions';


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
    cacheStore().clear();
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

    // Match against the instance state.
    // This is used as a in-memory cache to prevent multiple instances of the same experiment from getting differient variations.
    // It is wiped out with each pass of the RESET/LOAD/PLAY cycle
    const storeVariationName = cacheStore().getItem(experimentName);
    if (storeVariationName && variationsMap[storeVariationName]) {
      return variationsMap[storeVariationName];
    }

    // Match against the defaultVariationName
    if (defaultVariationName && variationsMap[defaultVariationName]) {
      return variationsMap[defaultVariationName];
    }

    // Pick a variation ramdomly
    const variation = randomVariation(experiment);
    // Record the choice in the tmp cache
    cacheStore().setItem(experimentName, variation.get('name'));
    // Return the chosen variation
    return variation;
  }
};

export const randomVariation = (experiment) => {
  const getWeight = (variation) => variation.get('weight', 0);
  const variations = experiment.get('variations').filterNot( variation => getWeight(variation) <= 0 ).sortBy( variation => getWeight(variation) );
  const ranges = variations.reduce(
    (list, variation) => list.push(Immutable.Range(0, getWeight(variation))),
    Immutable.List([])
  );
  const scoreTotal = variations.reduce( (total, variation) => total + getWeight(variation), 0);
  // Find the range that contains our score
  const score = Math.floor(Math.abs(Math.random() * scoreTotal));
  const variationIndex = ranges.findIndex( range => range.includes(score) );
  // Retrieve the selected variation
  const variation = variations.get(variationIndex, variations.last());
  return variation;
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
  return noopStore;
};
