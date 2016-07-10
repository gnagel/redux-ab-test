import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect, spy } from 'test_helper';

import { cacheStore } from '../utils/create-cache-store';
import findExperiment from '../utils/find-experiment';
import selectVariation from '../utils/select-variation';

import reduxAbTest, { VariationType, ExperimentType, initialState, middleware } from './index';
import {
  RESET,
  LOAD,
  ACTIVATE,
  DEACTIVATE,
  PLAY,
  WIN,
  REGISTER_ADHOC
} from './index';
import {
  reset,
  load,
  activate,
  deactivate,
  // TODO: play,
  win,
  registerAdhoc,
  // TODO: enqueueAWin,
  // TODO: respondToWin
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

  describe('constants', () => {
    it('RESET', () => {
      expect(RESET).to.be.equal('redux-ab-test/RESET');
    });

    it('LOAD', () => {
      expect(LOAD).to.be.equal('redux-ab-test/LOAD');
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

    it('REGISTER_ADHOC', () => {
      expect(REGISTER_ADHOC).to.be.equal('redux-ab-test/REGISTER_ADHOC');
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
        types_path:  undefined
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

    sharedActionExamples({
      action: registerAdhoc,
      type:   REGISTER_ADHOC,
      args:   {
        experiment
      },
      payload: Immutable.fromJS({
        experiment
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
      newState: initialState.set('active', Immutable.fromJS({ "Test-Name": "Variation #A" })).set('experiments', Immutable.fromJS([experiment]))
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


    sharedReducerExamples({
      type:    REGISTER_ADHOC,
      state:   undefined,
      payload: Immutable.fromJS({
        experiment
      }),
      newState: initialState.set('experiments', Immutable.fromJS([experiment]))
    });

    sharedReducerExamples({
      type:    REGISTER_ADHOC,
      state:   undefined,
      payload: Immutable.fromJS({
        experiment: {...experiment, win_action_types: []}
      }),
      newState: initialState.set('experiments', Immutable.fromJS([{...experiment, win_action_types: []}]))
    });

    sharedReducerExamples({
      type:    REGISTER_ADHOC,
      state:   undefined,
      payload: Immutable.fromJS({
        experiment: {...experiment, win_action_types: ['Test-action-type']}
      }),
      newState: initialState.merge({
        experiments:      [{...experiment, win_action_types: ['Test-action-type']}],
        win_action_types: {
          'Test-action-type': [experiment.name]
        }
      })
    });
  });


  //
  // State Selectors
  //
  describe('selectors', () => {
    describe('findExperiment', () => {
      it('exists', () => {
        expect(findExperiment).to.exist;
        expect(findExperiment).to.be.a('function');
      });

      it('has the correct experiment', () => {
        const output = findExperiment({
          reduxAbTest:    initialState.set('experiments', Immutable.fromJS([experiment])),
          experimentName: experiment.name
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(experiment);
      });

      it('throws an Error', () => {
        const output = () => findExperiment({
          reduxAbTest:    initialState,
          experimentName: experiment.name
        });
        expect(output).to.throw(Error);
      });
    });

    describe('selectVariation', () => {
      it('exists', () => {
        expect(selectVariation).to.exist;
        expect(selectVariation).to.be.a('function');
      });

      it('chooses the active variation from redux store', () => {
        const output = selectVariation({
          reduxAbTest:          initialState.set('experiments', Immutable.fromJS([experiment])).set('active', Immutable.fromJS({"Test-Name": "Variation #B"})),
          experiment:           Immutable.fromJS(experiment),
          defaultVariationName: null,
          cacheStore
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(variation_b);
      });

      it('chooses the defaultVariationName variation', () => {
        const output = selectVariation({
          reduxAbTest:          initialState.set('experiments', Immutable.fromJS([experiment])),
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
          reduxAbTest:          initialState.set('experiments', Immutable.fromJS([experiment])),
          experiment:           Immutable.fromJS(experiment),
          defaultVariationName: null,
          cacheStore
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(variation_b);
      });

      it('randomly assigns a variation, ignoring weight=0 records', () => {
        const output = selectVariation({
          reduxAbTest:          initialState.set('experiments', Immutable.fromJS([experiment])),
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
      const output = middleware(store)(next)(action);
      expect(next).to.have.been.calledOnce;
    });

    it('ignores wins if there are no matching experiments', () => {
      next = spy();
      reduxAbTest = initialState.merge({
        win_action_types: {}
      });
      const action = {type: 'Test-action-type'};
      const output = middleware(store)(next)(action);
      expect(next).to.have.been.calledOnce;
    });

    it('only generates one action', () => {
      reduxAbTest = initialState.merge({
        win_action_types: {}
      });
      const action = {type: 'Test-action-type'};
      const output = middleware(store)(next)(action);
      expect(recordedActions).to.deep.equal([
        action
      ]);
    });

    it('enqueues 1x win per registered experiment', () => {
      reduxAbTest = initialState.merge({
        experiments:      [experiment],
        win_action_types: {
          'Test-action-type': [experiment.name, 'Test-experiment-2']
        },
        active: {
          'Test-Name': variation_a.name
        }
      });
      const action = { type: 'Test-action-type', payload: { example: 'payload' } };
      const output = middleware(store)(next)(action);
      expect(recordedActions).to.deep.equal([
        action,
        {
          type:    WIN,
          payload: Immutable.fromJS({
            experiment,
            variation:     variation_a,
            actionType:    action.type,
            actionPayload: action.payload
          })
        }
      ]);
    });

  });

});
