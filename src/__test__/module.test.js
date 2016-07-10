import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect } from 'test_helper';

import { VariationType, ExperimentType, reduxAbTest, reduxAbTestInitialState } from '../index';
import { reset, load, registerAdhoc, activate, play, win, deactivate } from '../module';
import {
  RESET,
  LOAD,
  REGISTER_ADHOC,
  ACTIVATE,
  DEACTIVATE,
  PLAY,
  WIN
} from '../module';
import findExperiment from '../utils/find-experiment';
import selectVariation from '../utils/select-variation';
import { cacheStore } from '../utils/create-cache-store';


const variation_original:VariationType = {
  name: "Original",
  weight: 5000
};
const variation_a:VariationType = {
  name: "Variation #A",
  weight: 5000
};
const variation_b:VariationType = {
  name: "Variation #B",
  weight: 0
};
const experiment:ExperimentType = {
  name: "Test-Name",
  variations: [
    variation_original,
    variation_a,
    variation_b
  ]
};


describe("__TEST__/reduxAbTest", () => {
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
      action: reset,
      type: RESET,
      args: undefined,
      payload: Immutable.fromJS({})
    });

    sharedActionExamples({
      action: load,
      type: LOAD,
      args: {
        experiments: [experiment],
        active: { "Test-Name": "Variation #A" },
      },
      payload: Immutable.fromJS({
        experiments: [experiment],
        active: { "Test-Name": "Variation #A" },
        types_path: undefined
      })
    });

    sharedActionExamples({
      action: load,
      type: LOAD,
      args: {
        experiments: [experiment],
        active: { "Test-Name": "Variation #A" },
        types_path: ['Test-win-path']
      },
      payload: Immutable.fromJS({
        experiments: [experiment],
        active: { "Test-Name": "Variation #A" },
        types_path: ['Test-win-path']
      })
    });

    sharedActionExamples({
      action: activate,
      type: ACTIVATE,
      args: {
        experiment: experiment
      },
      payload: Immutable.fromJS({
        experiment: experiment
      })
    });

    sharedActionExamples({
      action: deactivate,
      type: DEACTIVATE,
      args: {
        experiment: experiment
      },
      payload: Immutable.fromJS({
        experiment: experiment
      })
    });

    sharedActionExamples({
      action: win,
      type: WIN,
      args: {
        experiment: experiment,
        variation: variation_original
      },
      payload: Immutable.fromJS({
        experiment: experiment,
        variation: variation_original,
        actionType: undefined,
        actionPayload: undefined
      })
    });
  });


  //
  // Initial State
  //
  describe('reduxAbTestInitialState', () => {
    it('exists', () => {
      expect(reduxAbTestInitialState).to.exist;
      expect(reduxAbTestInitialState).to.be.an.instanceof(Immutable.Map);
    });

    const sharedDescribe = (field, type) => {
      it(field, () => {
        expect(reduxAbTestInitialState.toJS()[field]).to.exist;
        expect(reduxAbTestInitialState.toJS()[field]).to.be.a(type);
        expect(reduxAbTestInitialState.toJS()[field]).to.be.blank;
      });
    };
    sharedDescribe('experiments', 'array');
    sharedDescribe('running', 'object');
    sharedDescribe('active', 'object');
    sharedDescribe('winners', 'object');
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

        it('has the correct reduxAbTestInitialState', () => {
          const output = reduxAbTest(undefined, {});
          expect(output).to.eql(reduxAbTestInitialState);
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
      type: RESET,
      state: undefined,
      payload: undefined,
      newState: reduxAbTestInitialState
    });

    sharedReducerExamples({
      type: LOAD,
      state: undefined,
      payload: Immutable.fromJS({
        experiments: [ experiment ],
        active: { "Test-Name": "Variation #A" }
      }),
      newState: reduxAbTestInitialState.set('active', Immutable.fromJS({ "Test-Name": "Variation #A" })).set('experiments', Immutable.fromJS([experiment]))
    });

    sharedReducerExamples({
      type: ACTIVATE,
      state: reduxAbTestInitialState,
      payload: Immutable.fromJS({
        experiment
      }),
      newState: reduxAbTestInitialState.set('running', Immutable.fromJS({ "Test-Name": 1 }))
    });

    sharedReducerExamples({
      type: DEACTIVATE,
      state: reduxAbTestInitialState.set('running', Immutable.fromJS({ "Test-Name": 1 })),
      payload: Immutable.fromJS({
        experiment
      }),
      newState: reduxAbTestInitialState
    });

    sharedReducerExamples({
      type: PLAY,
      state: undefined,
      payload: Immutable.fromJS({
        experiment: experiment,
        variation: variation_a
      }),
      newState: reduxAbTestInitialState.set('active', Immutable.fromJS({ "Test-Name": "Variation #A" }))
    });

    sharedReducerExamples({
      type: WIN,
      state: undefined,
      payload: Immutable.fromJS({
        experiment: experiment,
        variation: variation_b
      }),
      newState: reduxAbTestInitialState.set('winners', Immutable.fromJS({ "Test-Name": "Variation #B" }))
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
          reduxAbTest: reduxAbTestInitialState.set('experiments', Immutable.fromJS([experiment])),
          experimentName: experiment.name
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(experiment);
      });

      it('throws an Error', () => {
        const output = () => findExperiment({
          reduxAbTest: reduxAbTestInitialState,
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
          reduxAbTest: reduxAbTestInitialState.set('experiments', Immutable.fromJS([experiment])).set('active', Immutable.fromJS({"Test-Name": "Variation #B"})),
          experiment: Immutable.fromJS(experiment),
          defaultVariationName: null,
          cacheStore
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(variation_b);
      });

      it('chooses the defaultVariationName variation', () => {
        const output = selectVariation({
          reduxAbTest: reduxAbTestInitialState.set('experiments', Immutable.fromJS([experiment])),
          experiment: Immutable.fromJS(experiment),
          defaultVariationName: "Variation #B",
          cacheStore
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(variation_b);
      });

      it('chooses the active variation from localcache', () => {
        cacheStore.setItem(experiment.name, variation_b.name);
        const output = selectVariation({
          reduxAbTest: reduxAbTestInitialState.set('experiments', Immutable.fromJS([experiment])),
          experiment: Immutable.fromJS(experiment),
          defaultVariationName: null,
          cacheStore
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(variation_b);
      });

      it('randomly assigns a variation, ignoring weight=0 records', () => {
        const output = selectVariation({
          reduxAbTest: reduxAbTestInitialState.set('experiments', Immutable.fromJS([experiment])),
          experiment: Immutable.fromJS(experiment),
          defaultVariationName: null,
          cacheStore
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.not.deep.equal(variation_b);
      });
    });

  });

});
