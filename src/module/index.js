/** @flow */
import React                             from "react"; // eslint-disable-line no-unused-vars
import Immutable                         from 'immutable';
import _flattenDeep                      from 'lodash/flattenDeep';
import _compact                          from 'lodash/compact';
import { createAction, handleActions }   from 'redux-actions';
import { cacheStore }                    from '../utils/create-cache-store';
import availableExperiments              from '../utils/available-experiments';
import getKey                            from '../utils/get-key';
import generateWinActions                from '../utils/generate-win-actions';
import { immutableExperiment, immutableExperimentVariation } from '../utils/wraps-immutable';

//
// Redux Action Types
//
export const RESET          = 'redux-ab-test/RESET';
export const LOAD           = 'redux-ab-test/LOAD';
export const SET_AUDIENCE   = 'redux-ab-test/SET_AUDIENCE';
export const SET_ACTIVE     = 'redux-ab-test/SET_ACTIVE';
export const ACTIVATE       = 'redux-ab-test/ACTIVATE';
export const DEACTIVATE     = 'redux-ab-test/DEACTIVATE';
export const PLAY           = 'redux-ab-test/PLAY';
export const WIN            = 'redux-ab-test/WIN';


//
// Redux Action Creators:
//
export const reset         = createAction(RESET,            ()              => Immutable.fromJS({}));
export const load          = createAction(LOAD,             (opts = {})     => Immutable.fromJS(opts) );
export const setAudience   = createAction(SET_AUDIENCE,     (audience = {}) => Immutable.fromJS({audience}));
export const setActive     = createAction(SET_ACTIVE,       (active = {})   => Immutable.fromJS({active}));
export const activate      = createAction(ACTIVATE,         immutableExperiment );
export const deactivate    = createAction(DEACTIVATE,       immutableExperiment );
export const play          = createAction(PLAY,             immutableExperimentVariation );
export const win           = createAction(WIN,              ({experiment, variation, actionType, actionPayload}) => Immutable.fromJS({experiment, variation, actionType, actionPayload}) );


export const initialState = Immutable.fromJS({
  experiments:          [ /** Array of "experiment objects" */                        ],
  availableExperiments: { /** Hash of  "experiment key" => "experiment objects" */    },
  running:              { /** "experiment id" => counter  */                          },
  active:               { /** "experiment id" => "variation id" */                    },
  winners:              { /** "experiment id" => "variation id" */                    },
  audience:             { /** Any props you want to use for user/session targeting */ },
  selector_path:        ['key'],
  types_path:           ['win_action_types'],
  props_path:           ['componentProps'],
  audience_path:        ['audienceProps'],
  win_action_types:     { /** Array of Redux Action Types */ },
});


export const middleware = (store:Object) => (next:Function) => (action:Object) => {
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


export const flattenCompact = (list) => Immutable.List( _compact(_flattenDeep(Immutable.fromJS([list]).toJS())) );


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
    const types_path    = flattenCompact(payload.get('types_path',    initialState.get('types_path')));
    const props_path    = flattenCompact(payload.get('props_path',    initialState.get('props_path')));
    const audience_path = flattenCompact(payload.get('audience_path', initialState.get('audience_path')));
    const experiments   = payload.get('experiments');
    const active        = payload.has('active')   ? payload.get('active')   : state.get('active');
    const audience      = payload.has('audience') ? payload.get('audience') : state.get('audience');

    const win_action_types = experiments.reduce(
      (map, experiment) => {
        const key = getKey(experiment);
        const types = flattenCompact(experiment.getIn(types_path));
        types.forEach(type => {
          const list = map[type] || [];
          list.push(key);
          map[type] = list;
        });
        return map;
      },
      {}
    );

    return initialState.merge({
      availableExperiments: availableExperiments({experiments, audience_path, audience}),
      experiments,
      audience,
      active,
      types_path,
      props_path,
      audience_path,
      win_action_types
    });
  },


  /**
   * Set the Audience for the experiments
   */
  [SET_AUDIENCE]: (state, { payload }) => {
    const audience       = payload.get('audience');
    const experiments    = state.get('experiments');
    const audience_path  = state.get('audience_path');
    return state.merge({
      availableExperiments: availableExperiments({experiments, audience_path, audience}),
      audience,
    });
  },


  /**
   * Set the Active variations
   */
  [SET_ACTIVE]: (state, { payload }) => {
    return state.set('active', payload.get('active'));
  },


  /**
   * ACTIVATE the experiment
   */
  [ACTIVATE]: (state, { payload }) => {
    const experimentKey = getKey(payload.get('experiment'));
    const counter = (state.get('running').get(experimentKey) || 0) + 1;
    const running = state.get('running').set(experimentKey, counter);
    return state.set('running', running);
  },


  /**
   * DEACTIVATE the experiment
   */
  [DEACTIVATE]: (state, { payload }) => {
    const experimentKey = getKey(payload.get('experiment'));
    const counter = (state.get('running').get(experimentKey) || 0) - 1;
    const running = (counter <= 0) ? state.get('running').delete(experimentKey) : state.get('running').set(experimentKey, counter);
    return state.set('running', running);
  },


  /**
   * A user saw an experiment
   * @payload { experiment:ExperimentType, variation:VariationType }
   */
  [PLAY]: (state, { payload }) => {
    const experimentKey = getKey(payload.get('experiment'));
    const variationKey  = getKey(payload.get('variation'));
    const active        = state.get('active').set(experimentKey, variationKey);
    cacheStore.removeItem(experimentKey);
    return state.set('active', active);
  },


  /**
   * A user interacted with the variation
   * @payload { experiment:ExperimentType, variation:VariationType }
   */
  [WIN]: (state, { payload }) => {
    const experimentKey = getKey(payload.get('experiment'));
    const variationKey  = getKey(payload.get('variation'));
    const winners       = state.get('winners').set(experimentKey, variationKey);
    return state.set('winners', winners);
  },
};

export default handleActions(reducers, initialState);
