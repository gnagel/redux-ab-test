/** @flow */
import React                             from "react"; // eslint-disable-line no-unused-vars
import Immutable                         from 'immutable';
import _flattenDeep                      from 'lodash/flattenDeep';
import _compact                          from 'lodash/compact';
import { createAction, handleActions }   from 'redux-actions';
import { cacheStore }                    from '../utils/create-cache-store';
import availableExperiments              from '../utils/available-experiments';
import fulfilledExperiments              from '../utils/fulfilled-experiments';
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
  fulfilled:            [ /** Array of "experiment keys" */ ],
  availableExperiments: { /** Hash of  "experiment key" => "experiment objects" */    },
  running:              { /** "experiment id" => counter  */                          },
  active:               { /** "experiment id" => "variation id" */                    },
  winners:              { /** "experiment id" => "variation id" */                    },
  audience:             { /** Any props you want to use for user/session targeting */ },
  route:                { pathName: null, search: null, action: null, query: {}, params: {} },
  key_path:             ['key'],
  fulfilled_path:       ['fulfilled_action_types'],
  types_path:           ['win_action_types'],
  props_path:           ['componentProps'],
  audience_path:        ['audienceProps'],
  persistent_path:      ['persistentExperience'],
  single_success_path:  ['singleSuccess'],  // Should the experiment be removed from availableExperiments once it has been won?
  route_path:           ['routeProps'],
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

const computeAvailableExperiments = (state) => state.set('availableExperiments', availableExperiments({
  experiments:          state.get('experiments'),
  fulfilled:            state.get('fulfilled'),
  key_path:             state.get('key_path'),
  active:               state.get('active'),
  winners:              state.get('winners'),
  persistent_path:      state.get('persistent_path'),
  audience_path:        state.get('audience_path'),
  audience:             state.get('audience'),
  route:                state.get('route'),
  route_path:           state.get('route_path'),
  single_success_path:  state.get('single_success_path'),
}));


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
    const key_path             = flattenCompact(payload.get('key_path',            state.get('key_path')));
    const fulfilled_path       = flattenCompact(payload.get('fulfilled_path',      state.get('fulfilled_path')));
    const types_path           = flattenCompact(payload.get('types_path',          state.get('types_path')));
    const props_path           = flattenCompact(payload.get('props_path',          state.get('props_path')));
    const audience_path        = flattenCompact(payload.get('audience_path',       state.get('audience_path')));
    const persistent_path      = flattenCompact(payload.get('persistent_path',     state.get('persistent_path')));
    const single_success_path  = flattenCompact(payload.get('single_success_path', state.get('single_success_path')));
    const route_path           = flattenCompact(payload.get('route_path',          state.get('route_path')));
    const experiments          = payload.has('experiments') ? payload.get('experiments') : state.get('experiments');
    const active               = payload.has('active')      ? payload.get('active')      : state.get('active');
    const winners              = payload.has('winners')     ? payload.get('winners')     : state.get('winners');
    const audience             = payload.has('audience')    ? payload.get('audience')    : state.get('audience');
    const route                = payload.has('route')       ? payload.get('route')       : state.get('route');
    const fulfilled            = payload.has('fulfilled')   ? payload.get('fulfilled')   : state.get('fulfilled');


    const win_action_types = experiments.reduce(
      (map, experiment) => {
        const key = getKey(experiment);
        const types = flattenCompact([experiment.getIn(types_path), experiment.getIn(fulfilled_path)]);
        types.forEach(type => {
          const list = map[type] || [];
          list.push(key);
          map[type] = list;
        });
        return map;
      },
      {}
    );

    return computeAvailableExperiments(initialState.merge({
      experiments,
      fulfilled,
      fulfilled_path,
      audience,
      route,
      active,
      winners,
      key_path,
      types_path,
      props_path,
      persistent_path,
      audience_path,
      route_path,
      win_action_types,
      single_success_path,
    }));
  },


  /**
   * Set the Audience for the experiments
   */
  [SET_AUDIENCE]: (state, { payload }) => {
    const audience = payload.get('audience');
    return computeAvailableExperiments(state.set('audience', audience));
  },

  /**
   * Intercept the redux-router events, this is specifically for reac-router integration
   */
  ['@@reduxReactRouter/routerDidChange']: (state, { payload }) => {
    const { location = {}, params = {}, routes = [] } = payload;
    const { pathname, search, action, query = {} } = location;
    const path = Immutable.fromJS(routes).map( route => route.get('path') ).filter( path => path ).last(null);
    const route = Immutable.fromJS({ path: (path || pathname), pathName: pathname, search, action, query, params });
    return computeAvailableExperiments(state.set('route', route));
  },
  ['@@router/LOCATION_CHANGE']: (state, { payload }) => {
    const { pathname, search, query } = payload;
    const path = Immutable.fromJS(routes).map( route => route.get('path') ).filter( path => path ).last(null);
    const route = Immutable.fromJS({
      path: pathname,
      pathName: pathname,
      search,
      query
    });
    return computeAvailableExperiments(state.set('route', route));
  },


  /**
   * Set the Active variations
   */
  [SET_ACTIVE]: (state, { payload }) => {
    return computeAvailableExperiments(state.set('active', payload.get('active')));
  },


  /**
   * ACTIVATE the experiment
   */
  [ACTIVATE]: (state, { payload }) => {
    const experimentKey = getKey(payload.get('experiment'));
    const counter = (state.get('running').get(experimentKey) || 0) + 1;
    const running = state.get('running').set(experimentKey, counter);
    return computeAvailableExperiments(state.set('running', running));
  },


  /**
   * DEACTIVATE the experiment
   */
  [DEACTIVATE]: (state, { payload }) => {
    const experimentKey = getKey(payload.get('experiment'));
    const counter = (state.get('running').get(experimentKey) || 0) - 1;
    const running = (counter <= 0) ? state.get('running').delete(experimentKey) : state.get('running').set(experimentKey, counter);
    return computeAvailableExperiments(state.set('running', running));
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
    return computeAvailableExperiments(state.set('active', active));
  },


  /**
   * A user interacted with the variation
   * @payload { experiment:ExperimentType, variation:VariationType }
   */
  [WIN]: (state, { payload }) => {
    const experimentKey = getKey(payload.get('experiment'));
    const variationKey  = getKey(payload.get('variation'));
    const winners       = state.get('winners').set(experimentKey, variationKey);
    let   fulfilled     = state.get('fulfilled');

    // Get the action types from the experiment
    const actionType     = payload.get('actionType');
    const experiment     = payload.get('experiment');
    const types          = flattenCompact(experiment.getIn(state.get('fulfilled_path')));
    if (!types.isEmpty() && actionType && types.includes(actionType)) {
      fulfilled = Immutable.List([...Immutable.fromJS(fulfilled).toJS(), experimentKey])
    }
    return computeAvailableExperiments(state.set('winners', winners).set('fulfilled', fulfilled));
  },
};

export default handleActions(reducers, initialState);
