/** @flow */
import React        from 'react';
import Immutable    from 'immutable';
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
  WIN: 'redux-ab-test/WIN',
};

const payloadExperiments = (experiments:Array<ExperimentType>) => {
  return Immutable.fromJS({experiments})
};
const payloadExperimentAndVariation = (experiment:ExperimentType, variation:VariationType) => {
  return Immutable.fromJS({experiment, variation})
};

export const actions = {
  reset: createAction(constants.RESET),
  load: createAction(constants.LOAD, payloadExperiments),
  activate: createAction(constants.ACTIVATE, experimentName => experimentName),
  deactivate: createAction(constants.DEACTIVATE, payloadExperimentAndVariation),
  play: createAction(constants.PLAY, payloadExperimentAndVariation),
  win: createAction(constants.WIN, payloadExperimentAndVariation)
};


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
};

export default handleActions(reducers, initialState);


//
// Helpers:
//

// Helper to record an event occured
export const recordEvent = (eventName, experimentName, variationName) => {
  ana.trackEvent(false, eventName, { Experiment: experimentName, Variation: variationName });
}

const getLocalStorageValue = () => {
  const activeValue = emitter.getActiveVariant(this.props.name);
  if(typeof activeValue === "string") {
    return activeValue;
  }
  const storedValue = store.getItem('PUSHTELL-' + this.props.name);
  if(typeof storedValue === "string") {
    emitter.setActiveVariant(this.props.name, storedValue, true);
    return storedValue;
  }
  if(typeof this.props.defaultVariantName === 'string') {
    emitter.setActiveVariant(this.props.name, this.props.defaultVariantName);
    return this.props.defaultVariantName;
  }
  const variants = emitter.getSortedVariants(this.props.name);
  const weights = emitter.getSortedVariantWeights(this.props.name);
  const weightSum = weights.reduce((a, b) => {return a + b;}, 0);
  let weightedIndex = typeof this.props.userIdentifier === 'string' ? Math.abs(crc32(this.props.userIdentifier) % weightSum) : Math.floor(Math.random() * weightSum);
  let randomValue = variants[variants.length - 1];
  for (let index = 0; index < weights.length; index++) {
    weightedIndex -= weights[index];
    if (weightedIndex < 0) {
      randomValue = variants[index];
      break;
    }
  }
  emitter.setActiveVariant(this.props.name, randomValue);
  return randomValue;
};
