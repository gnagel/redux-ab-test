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
  reset: createAction(constants.RESET),
  load: createAction(constants.LOAD, (experiments:Array<ExperimentType>) => {
    return Immutable.fromJS({experiments})
  }),
  activate: createAction(constants.ACTIVATE, (experiment:ExperimentType) => {
    return Immutable.fromJS({experiment})
  }),
  deactivate: createAction(constants.DEACTIVATE, (experiment:ExperimentType) => {
    return Immutable.fromJS({experiment})
  }),
  play: createAction(constants.PLAY, (experiment:ExperimentType, variation:VariationType) => {
    return Immutable.fromJS({experiment, variation})
  }),
  win: createAction(constants.WIN, (experiment:ExperimentType, variation:VariationType) => {
    return Immutable.fromJS({experiment, variation})
  })
};


export const selectors = {
  /**
   * Helper function: Convert `children` to a hash of { `name` => variation }
   */
  mapChildrenToVariationElements: (children) => {
    const variationElements = {};
    React.Children.forEach(children, element => variationElements[element.props.name] = element);
    return Immutable.fromJS(variationElements);
  },
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
    // Hash of variation.name => VariationType
    const variationsMap = {};
    experiment.get('variations').forEach( variation => variationsMap[variation.get('name')] = variation );
    // Total weight of the variations
    const weightSum = experiment.get('variations').reduce(
      (total, variant) => { return total + variant.get('weight'); },
      0
    );

    // Match against the redux state
    const activeVariationName = reduxAbTest.get('active').get(experiment.name);
    if (activeVariationName && variationsMap[activeVariationName]) {
      return variationsMap[activeVariationName];
    }

    // Match against the localstore/cookie state
    const storeVariationName = store.getItem('redux-ab-test--' + experiment.get('name'));
    if (storeVariationName && variationsMap[storeVariationName]) {
      return variationsMap[storeVariationName];
    }

    // Randomly assign a varation:
    const weightedIndex = Math.floor(Math.abs(Math.random(weightSum) * weightSum));
    let randomValue = experiment.get('variations').last();
    for (let index = 0; index < weights.length; index++) {
      weightedIndex -= weights[index];
      if (weightedIndex < 0) {
        randomValue = variants[index];
        break;
      }
    }
    emitter.setActiveVariant(experimentName, randomValue);
    return randomValue;

    return null;
  }
}


export const initialState = Immutable.fromJS({
  experiments: [ /** Array of ExperimentType objects */ ],
  active: { /** "experiment name" => "variation name" */ },
  played: { /** "experiment name" => "variation name" */ },
  winners: { /** "experiment name" => "variation name" */ },
});


const reducers = {
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
    const counter = (state.get('active').get(experimentName) || 0) + 1;
    const active = state.get('active').set(experimentName, counter);
    return state.set('active', active);
  },

  /**
   * DEACTIVATE the available experiments. and reset the state of the server
   */
  [constants.DEACTIVATE]: (state, { payload }) => {
    const { experimentName } = payload;
    const counter = (state.get('active').get(experimentName) || 0) - 1;
    let active;
    if (counter <= 0) {
      active = state.get('active').delete(experimentName);
    } else {
      active = state.get('active').set(experimentName, counter);
    }
    return state.set('active', active);
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
};

export default handleActions(reducers, initialState);


//
// Helpers:
//
const noopStore = () => {
  return {
    getItem: () => null,
    setItem: () => null
  }
};

let store = noopStore();
if(window && window.localStorage) {
  try {
    const key = '__redux-ab-test__';
    window.localStorage.setItem(key, key);
    if (window.localStorage.getItem(key) !== key) {
      store = noopStore();
    } else {
      window.localStorage.removeItem(key);
      store = window.localStorage;
    }
  } catch(e) {
    store = noopStore();
  }
}
