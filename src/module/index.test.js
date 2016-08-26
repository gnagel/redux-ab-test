import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect, spy } from 'test_helper';

import { cacheStore } from '../utils/create-cache-store';
import selectVariation from '../utils/select-variation';

import reduxAbTest, { VariationType, ExperimentType, initialState, middleware, flattenCompact } from './index';
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

const variation_original:VariationType = {
  name:   "Original",
  weight: 5000
};
const variation_a:VariationType = {
  name:   "Variation #A",
  weight: 5000
};
const variation_b:VariationType = {
  name:   "Variation #B",
  weight: 0
};
const experiment:ExperimentType = {
  name:       "Test-Name",
  variations: [
    variation_original,
    variation_a,
    variation_b
  ]
};


describe('(Redux) src/module/index.js', () => {
  it('exists', () => {
    expect(reduxAbTest).to.exist;
  });
  beforeEach(() => {
    cacheStore.clear();
  });
  afterEach(() => {
    cacheStore.clear();
  });

  describe('flattenCompact', () => {
    it('exists', () => { expect(flattenCompact).to.exist; });
    it('has the correct type', () => { expect(flattenCompact).to.be.a('function'); });
    it('has the correct output', () => { expect(flattenCompact().toJS()).to.deep.equal([]); });
    it('has the correct output', () => { expect(flattenCompact(null).toJS()).to.deep.equal([]); });
    it('has the correct output', () => { expect(flattenCompact(undefined).toJS()).to.deep.equal([]); });
    it('has the correct output', () => { expect(flattenCompact([null]).toJS()).to.deep.equal([]); });
    it('has the correct output', () => { expect(flattenCompact([undefined]).toJS()).to.deep.equal([]); });
    it('has the correct output', () => { expect(flattenCompact([]).toJS()).to.deep.equal([]); });
    it('has the correct output', () => { expect(flattenCompact('a').toJS()).to.deep.equal(['a']); });
    it('has the correct output', () => { expect(flattenCompact(['a', 'b']).toJS()).to.deep.equal(['a', 'b']); });
    it('has the correct output', () => { expect(flattenCompact(['a', null, false, 0, '', undefined, 'b']).toJS()).to.deep.equal(['a', 'b']); });
  });

  describe('constants', () => {
    it('RESET', () => {
      expect(RESET).to.be.equal('redux-ab-test/RESET');
    });

    it('LOAD', () => {
      expect(LOAD).to.be.equal('redux-ab-test/LOAD');
    });

    it('SET_ACTIVE', () => {
      expect(SET_ACTIVE).to.be.equal('redux-ab-test/SET_ACTIVE');
    });

    it('SET_AUDIENCE', () => {
      expect(SET_AUDIENCE).to.be.equal('redux-ab-test/SET_AUDIENCE');
    });

    it('ACTIVATE', () => {
      expect(ACTIVATE).to.be.equal('redux-ab-test/ACTIVATE');
    });

    it('DEACTIVATE', () => {
      expect(DEACTIVATE).to.be.equal('redux-ab-test/DEACTIVATE');
    });

    it('PLAY', () => {
      expect(PLAY).to.be.equal('redux-ab-test/PLAY');
    });

    it('WIN', () => {
      expect(WIN).to.be.equal('redux-ab-test/WIN');
    });
  });


  //
  // Action Creators
  //
  describe('actions', () => {
    const sharedActionExamples = ({action, type, args, payload}) => {
      describe(type.split('/')[1], () => {
        it('exists', () => {
          expect(action).to.exist;
          expect(action).to.be.a('function');
        });

        it('has correct keys', () => {
          const output = action(args);
          expect(output).to.have.keys('type', 'payload');
        });

        it('has correct type', () => {
          const output = action(args);
          expect(output.type).to.be.equal(type);
        });

        it('has correct payload', () => {
          const output = action(args);
          expect(output.payload).to.be.an.instanceof(Immutable.Map);
          expect(output.payload).to.deep.equal(payload);
        });
      });
    };

    sharedActionExamples({
      action:  reset,
      type:    RESET,
      args:    undefined,
      payload: Immutable.fromJS({})
    });

    sharedActionExamples({
      action: load,
      type:   LOAD,
      args:   {
        experiments: [experiment],
        active:      { "Test-Name": "Variation #A" }
      },
      payload: Immutable.fromJS({
        experiments: [experiment],
        active:      { "Test-Name": "Variation #A" },
      })
    });

    sharedActionExamples({
      action: load,
      type:   LOAD,
      args:   {
        experiments: [experiment],
        active:      { "Test-Name": "Variation #A" },
        types_path:  ['Test-win-path']
      },
      payload: Immutable.fromJS({
        experiments: [experiment],
        active:      { "Test-Name": "Variation #A" },
        types_path:  ['Test-win-path']
      })
    });

    sharedActionExamples({
      action: setAudience,
      type:   SET_AUDIENCE,
      args:   { "type": "New User" },
      payload: Immutable.fromJS({
        audience: { "type": "New User" },
      })
    });

    sharedActionExamples({
      action: setActive,
      type:   SET_ACTIVE,
      args:   { "Test-Name": "Variation #A" },
      payload: Immutable.fromJS({
        active:      { "Test-Name": "Variation #A" },
      })
    });

    sharedActionExamples({
      action: activate,
      type:   ACTIVATE,
      args:   {
        experiment: experiment
      },
      payload: Immutable.fromJS({
        experiment: experiment
      })
    });

    sharedActionExamples({
      action: deactivate,
      type:   DEACTIVATE,
      args:   {
        experiment: experiment
      },
      payload: Immutable.fromJS({
        experiment: experiment
      })
    });

    sharedActionExamples({
      action: win,
      type:   WIN,
      args:   {
        experiment: experiment,
        variation:  variation_original
      },
      payload: Immutable.fromJS({
        experiment:    experiment,
        variation:     variation_original,
        actionType:    undefined,
        actionPayload: undefined
      })
    });

    sharedActionExamples({
      action: win,
      type:   WIN,
      args:   {
        experiment:    experiment,
        variation:     variation_original,
        actionType:    'Test-action',
        actionPayload: { example: 'payload' }
      },
      payload: Immutable.fromJS({
        experiment:    experiment,
        variation:     variation_original,
        actionType:    'Test-action',
        actionPayload: { example: 'payload' }
      })
    });
  });


  //
  // Initial State
  //
  describe('initialState', () => {
    it('exists', () => {
      expect(initialState).to.exist;
      expect(initialState).to.be.an.instanceof(Immutable.Map);
    });

    const sharedDescribe = (field, type) => {
      it(field, () => {
        expect(initialState.toJS()[field]).to.exist;
        expect(initialState.toJS()[field]).to.be.a(type);
        expect(initialState.toJS()[field]).to.be.blank;
      });
    };
    sharedDescribe('experiments', 'array');
    sharedDescribe('availableExperiments', 'object');
    sharedDescribe('types_path', 'array');
    sharedDescribe('props_path', 'array');
    sharedDescribe('audience_path', 'array');
    sharedDescribe('running', 'object');
    sharedDescribe('active', 'object');
    sharedDescribe('winners', 'object');
    sharedDescribe('win_action_types', 'object');
  });


  //
  // Reducer
  //
  describe('reducer', () => {
    const sharedReducerExamples = ({type, state, payload, newState}) => {
      describe(type.split('/')[1], () => {
        it('exists', () => {
          expect(reduxAbTest).to.exist;
          expect(reduxAbTest).to.be.a('function');
        });

        it('has the correct initialState', () => {
          const output = reduxAbTest(undefined, {});
          expect(output).to.eql(initialState);
        });

        it('has correct type', () => {
          const output = reduxAbTest(state, { type, payload });
          expect(output).to.exist;
          expect(output).to.be.an.instanceof(Immutable.Map);
        });

        it('has correct newState', () => {
          const output = reduxAbTest(state, { type, payload });
          expect(output).to.exist;
          expect(output.toJSON()).to.deep.equal(newState.toJSON());
          // expect(output).to.deep.equal(newState);
        });
      });
    };

    sharedReducerExamples({
      type:     RESET,
      state:    undefined,
      payload:  undefined,
      newState: initialState
    });

    sharedReducerExamples({
      type:    LOAD,
      state:   undefined,
      payload: Immutable.fromJS({
        experiments: [ experiment ],
        active:      { "Test-Name": "Variation #A" }
      }),
      newState: initialState.merge({
        active:               { "Test-Name": "Variation #A" },
        experiments:          [ experiment ],
        availableExperiments: { 'Test-Name' : "Test-Name" },
      }),
    });

    sharedReducerExamples({
      type:    SET_ACTIVE,
      state:   initialState,
      payload: Immutable.fromJS({
        active: { "Test-Name": "Variation #A" }
      }),
      newState: initialState.merge({
        active: { "Test-Name": "Variation #A" },
      }),
    });

    // TODO: test changing the audience changes the availableExperiments
    sharedReducerExamples({
      type:    SET_AUDIENCE,
      state:   initialState,
      payload: Immutable.fromJS({
        audience:      { "type": "New User" },
      }),
      newState: initialState.merge({
        audience: { "type": "New User" },
        // TODO .set('availableExperiments', Immutable.fromJS([experiment]))
      })
    });

    sharedReducerExamples({
      type:    ACTIVATE,
      state:   initialState,
      payload: Immutable.fromJS({
        experiment
      }),
      newState: initialState.set('running', Immutable.fromJS({ "Test-Name": 1 }))
    });

    sharedReducerExamples({
      type:    DEACTIVATE,
      state:   initialState.set('running', Immutable.fromJS({ "Test-Name": 1 })),
      payload: Immutable.fromJS({
        experiment
      }),
      newState: initialState
    });

    sharedReducerExamples({
      type:    PLAY,
      state:   undefined,
      payload: Immutable.fromJS({
        experiment: experiment,
        variation:  variation_a
      }),
      newState: initialState.set('active', Immutable.fromJS({ "Test-Name": "Variation #A" }))
    });

    sharedReducerExamples({
      type:    WIN,
      state:   undefined,
      payload: Immutable.fromJS({
        experiment: experiment,
        variation:  variation_b
      }),
      newState: initialState.set('winners', Immutable.fromJS({ "Test-Name": "Variation #B" }))
    });
  });


  //
  // State Selectors
  //
  describe('selectors', () => {

    describe('selectVariation', () => {
      it('exists', () => {
        expect(selectVariation).to.exist;
        expect(selectVariation).to.be.a('function');
      });

      it('chooses the active variation from redux store', () => {
        const output = selectVariation({
          active:               Immutable.fromJS({"Test-Name": "Variation #B"}),
          experiment:           Immutable.fromJS(experiment),
          defaultVariationName: null,
          cacheStore
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(variation_b);
      });

      it('chooses the defaultVariationName variation', () => {
        const output = selectVariation({
          active:               Immutable.Map(),
          experiment:           Immutable.fromJS(experiment),
          defaultVariationName: "Variation #B",
          cacheStore
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(variation_b);
      });

      it('chooses the active variation from localcache', () => {
        cacheStore.setItem(experiment.name, variation_b.name);
        const output = selectVariation({
          active:               Immutable.Map(),
          experiment:           Immutable.fromJS(experiment),
          defaultVariationName: null,
          cacheStore
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(variation_b);
      });

      it('randomly assigns a variation, ignoring weight=0 records', () => {
        const output = selectVariation({
          active:               Immutable.Map(),
          experiment:           Immutable.fromJS(experiment),
          defaultVariationName: null,
          cacheStore
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.not.deep.equal(variation_b);
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
        getState: () => { return {reduxAbTest}; }
      };
    });

    it('exists', () => {
      expect(middleware).to.exist;
      expect(middleware).to.be.a('function');
    });

    it('doesnt generate new actions', () => {
      next = spy();
      const action = {type: 'Test-action-type'};
      middleware(store)(next)(action);
      expect(next).to.have.been.calledOnce;
    });

    it('ignores wins if there are no matching experiments', () => {
      next = spy();
      reduxAbTest = initialState.merge({
        win_action_types: {}
      });
      const action = {type: 'Test-action-type'};
      middleware(store)(next)(action);
      expect(next).to.have.been.calledOnce;
    });

    it('only generates one action', () => {
      reduxAbTest = initialState.merge({
        win_action_types: {}
      });
      const action = {type: 'Test-action-type'};
      middleware(store)(next)(action);
      expect(recordedActions).to.not.be.empty;
      expect(recordedActions).to.deep.equal([
        action
      ]);
    });

    it('enqueues 1x win per registered experiment', () => {
      reduxAbTest = initialState.merge({
        experiments: [experiment],
        win_action_types: {
          'Test-action-type': [experiment.name, 'Test-experiment-2']
        },
        active: {
          'Test-Name': variation_a.name
        }
      });
      const action = { type: 'Test-action-type', payload: { example: 'payload' } };
      middleware(store)(next)(action);
      expect(recordedActions).to.have.length(2);
      // 1st action is our input `action` above
      expect(recordedActions[0]).to.deep.equal(action);
      // 2nd action is the generated action from the win:
      expect(recordedActions[1]).to.deep.equal({
        type:    WIN,
        payload: Immutable.fromJS({
          experiment:    experiment,
          variation:     variation_a,
          actionType:    action.type,
          actionPayload: action.payload
        })
      });
    });

  });

});
