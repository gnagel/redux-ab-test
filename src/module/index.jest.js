import React from 'react'; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { spy } from 'sinon';
import { cacheStore } from '../utils/create-cache-store';
import selectVariation from '../utils/select-variation';

import reduxAbTest, { initialState, middleware, flattenCompact } from './index';
import { RESET, LOAD, SET_ACTIVE, SET_AUDIENCE, ACTIVATE, DEACTIVATE, PLAY, WIN } from './index';
import {
  reset,
  load,
  setActive,
  setAudience,
  activate,
  deactivate,
  // TODO: play,
  win,
} from './index';

const variation_original = {
  name:   'Original',
  weight: 5000,
};
const variation_a = {
  name:   'Variation #A',
  weight: 5000,
};
const variation_b = {
  name:   'Variation #B',
  weight: 0,
};
const experiment = {
  name:       'Test-Name',
  variations: [
    variation_original,
    variation_a,
    variation_b,
  ],
};


describe('(Redux) src/module/index.js', () => {
  it('exists', () => {
    expect(reduxAbTest).not.toBeUndefined;
    expect(reduxAbTest).not.toBeNull;
  });
  beforeEach(() => {
    cacheStore.clear();
  });
  afterEach(() => {
    cacheStore.clear();
  });

  describe('flattenCompact', () => {
    it('exists', () => { expect(flattenCompact).not.toBeUndefined; });
    it('has the correct type', () => { expect(typeof flattenCompact).toEqual('function'); });
    it('has the correct output', () => { expect(flattenCompact().toJS()).toEqual([]); });
    it('has the correct output', () => { expect(flattenCompact(null).toJS()).toEqual([]); });
    it('has the correct output', () => { expect(flattenCompact(undefined).toJS()).toEqual([]); });
    it('has the correct output', () => { expect(flattenCompact([null]).toJS()).toEqual([]); });
    it('has the correct output', () => { expect(flattenCompact([undefined]).toJS()).toEqual([]); });
    it('has the correct output', () => { expect(flattenCompact([]).toJS()).toEqual([]); });
    it('has the correct output', () => { expect(flattenCompact('a').toJS()).toEqual(['a']); });
    it('has the correct output', () => { expect(flattenCompact(['a', 'b']).toJS()).toEqual(['a', 'b']); });
    it('has the correct output', () => { expect(flattenCompact(['a', null, false, 0, '', undefined, 'b']).toJS()).toEqual(['a', 'b']); });
  });

  describe('constants', () => {
    it('RESET', () => {
      expect(RESET).toEqual('redux-ab-test/RESET');
    });

    it('LOAD', () => {
      expect(LOAD).toEqual('redux-ab-test/LOAD');
    });

    it('SET_ACTIVE', () => {
      expect(SET_ACTIVE).toEqual('redux-ab-test/SET_ACTIVE');
    });

    it('SET_AUDIENCE', () => {
      expect(SET_AUDIENCE).toEqual('redux-ab-test/SET_AUDIENCE');
    });

    it('ACTIVATE', () => {
      expect(ACTIVATE).toEqual('redux-ab-test/ACTIVATE');
    });

    it('DEACTIVATE', () => {
      expect(DEACTIVATE).toEqual('redux-ab-test/DEACTIVATE');
    });

    it('PLAY', () => {
      expect(PLAY).toEqual('redux-ab-test/PLAY');
    });

    it('WIN', () => {
      expect(WIN).toEqual('redux-ab-test/WIN');
    });
  });


  //
  // Action Creators
  //
  describe('actions', () => {
    const sharedActionExamples = ({action, type, args, payload}) => {
      describe(type.split('/')[1], () => {
        it('exists', () => {
          expect(action).not.toBeUndefined;
          expect(typeof action).toEqual('function');
        });

        it('has correct keys', () => {
          const output = action(args);
          expect(Object.keys(output)).toEqual(['type', 'payload']);
        });

        it('has correct type', () => {
          const output = action(args);
          expect(output.type).toEqual(type);
        });

        it('has correct payload', () => {
          const output = action(args);
          expect(Immutable.Map.isMap(output.payload)).toBeTruthy;
          expect(output.payload).toEqual(payload);
        });
      });
    };

    sharedActionExamples({
      action:  reset,
      type:    RESET,
      args:    undefined,
      payload: Immutable.fromJS({}),
    });

    sharedActionExamples({
      action: load,
      type:   LOAD,
      args:   {
        experiments: [experiment],
        active:      { 'Test-Name': 'Variation #A' },
      },
      payload: Immutable.fromJS({
        experiments: [experiment],
        active:      { 'Test-Name': 'Variation #A' },
      }),
    });

    sharedActionExamples({
      action: load,
      type:   LOAD,
      args:   {
        experiments: [experiment],
        active:      { 'Test-Name': 'Variation #A' },
        types_path:  ['Test-win-path'],
      },
      payload: Immutable.fromJS({
        experiments: [experiment],
        active:      { 'Test-Name': 'Variation #A' },
        types_path:  ['Test-win-path'],
      }),
    });

    sharedActionExamples({
      action:  setAudience,
      type:    SET_AUDIENCE,
      args:    { 'type': 'New User' },
      payload: Immutable.fromJS({
        audience: { 'type': 'New User' },
      }),
    });

    sharedActionExamples({
      action:  setActive,
      type:    SET_ACTIVE,
      args:    { 'Test-Name': 'Variation #A' },
      payload: Immutable.fromJS({
        active: { 'Test-Name': 'Variation #A' },
      }),
    });

    sharedActionExamples({
      action: activate,
      type:   ACTIVATE,
      args:   {
        experiment: experiment,
      },
      payload: Immutable.fromJS({
        experiment: experiment,
      }),
    });

    sharedActionExamples({
      action: deactivate,
      type:   DEACTIVATE,
      args:   {
        experiment: experiment,
      },
      payload: Immutable.fromJS({
        experiment: experiment,
      }),
    });

    sharedActionExamples({
      action: win,
      type:   WIN,
      args:   {
        experiment: experiment,
        variation:  variation_original,
      },
      payload: Immutable.fromJS({
        experiment:    experiment,
        variation:     variation_original,
        actionType:    undefined,
        actionPayload: undefined,
      }),
    });

    sharedActionExamples({
      action: win,
      type:   WIN,
      args:   {
        experiment:    experiment,
        variation:     variation_original,
        actionType:    'Test-action',
        actionPayload: { example: 'payload' },
      },
      payload: Immutable.fromJS({
        experiment:    experiment,
        variation:     variation_original,
        actionType:    'Test-action',
        actionPayload: { example: 'payload' },
      }),
    });
  });


  //
  // Initial State
  //
  describe('initialState', () => {
    it('exists', () => {
      expect(initialState).not.toBeUndefined;
      expect(Immutable.Map.isMap(initialState)).toBeTruthy;
    });

    const sharedDescribe = (field, defaultValue) => {
      it(field, () => {
        const value = initialState.toJS()[field];
        expect(value).not.toBeUndefined;
        expect(value).toEqual(defaultValue);
      });
    };
    sharedDescribe('experiments', []);
    sharedDescribe('availableExperiments', {});
    sharedDescribe('types_path', ['win_action_types']);
    sharedDescribe('props_path', ['componentProps']);
    sharedDescribe('audience_path', ['audienceProps']);
    sharedDescribe('running', {});
    sharedDescribe('active', {});
    sharedDescribe('winners', {});
    sharedDescribe('win_action_types', {});
  });


  //
  // Reducer
  //
  describe('reducer', () => {
    const sharedReducerExamples = ({type, state, payload, newState}) => {
      describe(type, () => {
        it('exists', () => {
          expect(reduxAbTest).not.toBeUndefined;
          expect(typeof reduxAbTest).toEqual('function');
        });

        it('has the correct initialState', () => {
          const output = reduxAbTest(undefined, { type: '@@INIT' });
          expect(output).toEqual(initialState);
        });

        it('has correct type', () => {
          const output = reduxAbTest(state, { type, payload });
          expect(output).not.toBeUndefined;
          expect(Immutable.Map.isMap(output)).toBeTruthy;
        });

        it('has correct newState', () => {
          const output = reduxAbTest(state, { type, payload });
          expect(output).not.toBeUndefined;
          expect(output.toJSON()).toEqual(newState.toJSON());
          // expect(output).toEqual(newState);
        });
      });
    };

    sharedReducerExamples({
      type:     RESET,
      state:    undefined,
      payload:  undefined,
      newState: initialState,
    });

    sharedReducerExamples({
      type:    LOAD,
      state:   undefined,
      payload: Immutable.fromJS({
        experiments: [ experiment ],
        active:      { 'Test-Name': 'Variation #A' },
      }),
      newState: initialState.merge({
        active:               { 'Test-Name': 'Variation #A' },
        experiments:          [ experiment ],
        availableExperiments: { 'Test-Name': 'Test-Name' },
      }),
    });

    sharedReducerExamples({
      type:    SET_ACTIVE,
      state:   initialState,
      payload: Immutable.fromJS({
        active: { 'Test-Name': 'Variation #A' },
      }),
      newState: initialState.merge({
        active: { 'Test-Name': 'Variation #A' },
      }),
    });

    // TODO: test changing the audience changes the availableExperiments
    sharedReducerExamples({
      type:    SET_AUDIENCE,
      state:   initialState,
      payload: Immutable.fromJS({
        audience: { 'type': 'New User' },
      }),
      newState: initialState.merge({
        audience: { 'type': 'New User' },
        // TODO .set('availableExperiments', Immutable.fromJS([experiment]))
      }),
    });

    sharedReducerExamples({
      type:    ACTIVATE,
      state:   initialState,
      payload: Immutable.fromJS({
        experiment,
      }),
      newState: initialState.set('running', Immutable.fromJS({ 'Test-Name': 1 })),
    });

    sharedReducerExamples({
      type:    DEACTIVATE,
      state:   initialState.set('running', Immutable.fromJS({ 'Test-Name': 1 })),
      payload: Immutable.fromJS({
        experiment,
      }),
      newState: initialState,
    });

    sharedReducerExamples({
      type:    PLAY,
      state:   undefined,
      payload: Immutable.fromJS({
        experiment: experiment,
        variation:  variation_a,
      }),
      newState: initialState.set('active', Immutable.fromJS({ 'Test-Name': 'Variation #A' })),
    });

    sharedReducerExamples({
      type:    WIN,
      state:   undefined,
      payload: Immutable.fromJS({
        experiment: experiment,
        variation:  variation_b,
      }),
      newState: initialState.merge({
        winners:   { 'Test-Name': 'Variation #B' },
        fulfilled: [],
      }),
    });

    // Action types filtering
    sharedReducerExamples({
      type:    WIN,
      state:   undefined,
      payload: Immutable.fromJS({
        experiment: experiment,
        variation:  variation_b,
        actionType: 'Not a fulfillment action',
      }),
      newState: initialState.merge({
        winners:   { 'Test-Name': 'Variation #B' },
        fulfilled: [],
      }),
    });

    // Action types filtering
    sharedReducerExamples({
      type:    WIN,
      state:   undefined,
      payload: Immutable.fromJS({
        experiment: {...experiment, fulfilled_action_types: ['Fulfilled Action'], types_path: ['Generic Action'] },
        variation:  variation_b,
        actionType: 'Not a registered action',
      }),
      newState: initialState.merge({
        winners:   { 'Test-Name': 'Variation #B' },
        fulfilled: [],
      }),
    });

    // Action types filtering
    sharedReducerExamples({
      type:    WIN,
      state:   undefined,
      payload: Immutable.fromJS({
        experiment: {...experiment, fulfilled_action_types: ['Fulfilled Action'], types_path: ['Generic Action'] },
        variation:  variation_b,
        actionType: 'Fulfilled Action',
      }),
      newState: initialState.merge({
        winners:   { 'Test-Name': 'Variation #B' },
        fulfilled: [ 'Test-Name' ],
      }),
    });

    // Action types filtering
    sharedReducerExamples({
      type:    WIN,
      state:   undefined,
      payload: Immutable.fromJS({
        experiment: {...experiment, fulfilled_action_types: ['Fulfilled Action'], types_path: ['Generic Action'] },
        variation:  variation_b,
        actionType: 'Fulfilled Action',
      }),
      newState: initialState.merge({
        winners:   { 'Test-Name': 'Variation #B' },
        fulfilled: [ 'Test-Name' ],
      }),
    });
  });


  //
  // State Selectors
  //
  describe('selectors', () => {

    describe('selectVariation', () => {
      it('exists', () => {
        expect(selectVariation).not.toBeUndefined;
        expect(typeof selectVariation).toEqual('function');
      });

      it('chooses the active variation from redux store', () => {
        const output = selectVariation({
          active:               Immutable.fromJS({'Test-Name': 'Variation #B'}),
          experiment:           Immutable.fromJS(experiment),
          defaultVariationName: null,
          cacheStore,
        });
        expect(output).not.toBeUndefined;
        expect(output.toJSON()).toEqual(variation_b);
      });

      it('chooses the defaultVariationName variation', () => {
        const output = selectVariation({
          active:               Immutable.Map(),
          experiment:           Immutable.fromJS(experiment),
          defaultVariationName: 'Variation #B',
          cacheStore,
        });
        expect(output).not.toBeUndefined;
        expect(output.toJSON()).toEqual(variation_b);
      });

      it('chooses the active variation from localcache', () => {
        cacheStore.setItem(experiment.name, variation_b.name);
        const output = selectVariation({
          active:               Immutable.Map(),
          experiment:           Immutable.fromJS(experiment),
          defaultVariationName: null,
          cacheStore,
        });
        expect(output).not.toBeUndefined;
        expect(output.toJSON()).toEqual(variation_b);
      });

      it('randomly assigns a variation, ignoring weight=0 records', () => {
        const output = selectVariation({
          active:               Immutable.Map(),
          experiment:           Immutable.fromJS(experiment),
          defaultVariationName: null,
          cacheStore,
        });
        expect(output).not.toBeUndefined;
        expect(output.toJSON()).not.toEqual(variation_b);
      });
    });

  });


  describe('middleware', () => {
    let recordedActions = [];
    let next;
    let reduxAbTest;
    let store;
    beforeEach(() => {
      recordedActions = [];
      next = (action) => { recordedActions.push(action); };
      reduxAbTest = initialState;
      store = {
        getState: () => { return {reduxAbTest}; },
      };
    });

    it('exists', () => {
      expect(middleware).not.toBeUndefined;
      expect(typeof middleware).toEqual('function');
    });

    it('doesnt generate new actions', () => {
      next = spy();
      const action = {type: 'Test-action-type'};
      middleware(store)(next)(action);
      expect(next.called).toBeTruthy;
    });

    it('ignores wins if there are no matching experiments', () => {
      next = spy();
      reduxAbTest = initialState.merge({
        win_action_types: {},
      });
      const action = {type: 'Test-action-type'};
      middleware(store)(next)(action);
      expect(next.called).toBeTruthy;
    });

    it('only generates one action', () => {
      reduxAbTest = initialState.merge({
        win_action_types: {},
      });
      const action = {type: 'Test-action-type'};
      middleware(store)(next)(action);
      expect(recordedActions.length).not.toEqual(0);
      expect(recordedActions).toEqual([
        action,
      ]);
    });

    it('enqueues 1x win per registered experiment', () => {
      reduxAbTest = initialState.merge({
        experiments:      [experiment],
        win_action_types: {
          'Test-action-type': [experiment.name, 'Test-experiment-2'],
        },
        active: {
          'Test-Name': variation_a.name,
        },
      });
      const action = { type: 'Test-action-type', payload: { example: 'payload' } };
      middleware(store)(next)(action);
      expect(recordedActions.length).toEqual(2);
      // 1st action is our input `action` above
      expect(recordedActions[0]).toEqual(action);
      // 2nd action is the generated action from the win:
      expect(recordedActions[1]).toEqual({
        type:    WIN,
        payload: Immutable.fromJS({
          experiment:    experiment,
          variation:     variation_a,
          actionType:    action.type,
          actionPayload: action.payload,
        }),
      });
    });

  });

});
