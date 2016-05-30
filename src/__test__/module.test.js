import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect } from 'test_helper';

import reduxAbTest, { VariationType, ExperimentType, constants, actions, selectors, initialState, cacheStore } from '../module';


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


describe.skip('reduxAbTest', () => {
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
    it('exists', () => {
      expect(constants).to.exist;
      expect(constants).to.be.a('object');
      expect(constants).to.not.be.blank;
    });

    const sharedConstant = (key) => {
      it(key, () => {
        expect(constants[key]).to.be.equal(`redux-ab-test/${key}`);
      });
    };

    sharedConstant('RESET');
    sharedConstant('LOAD');
    sharedConstant('ACTIVATE');
    sharedConstant('DEACTIVATE');
    sharedConstant('PLAY');
    sharedConstant('WIN');
  });


  //
  // Action Creators
  //
  describe('actions', () => {
    it('exists', () => {
      expect(actions).to.exist;
      expect(actions).to.be.a('object');
      expect(actions).to.not.be.blank;
    });


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
      action: actions.reset,
      type: constants.RESET,
      args: undefined,
      payload: Immutable.fromJS({})
    });

    sharedActionExamples({
      action: actions.load,
      type: constants.LOAD,
      args: {
        experiments: [experiment],
        active: { "Test-Name": "Variation #A" }
      },
      payload: Immutable.fromJS({
        experiments: [experiment],
        active: { "Test-Name": "Variation #A" }
      })
    });

    sharedActionExamples({
      action: actions.activate,
      type: constants.ACTIVATE,
      args: {
        experiment: experiment
      },
      payload: Immutable.fromJS({
        experiment: experiment
      })
    });

    sharedActionExamples({
      action: actions.deactivate,
      type: constants.DEACTIVATE,
      args: {
        experiment: experiment
      },
      payload: Immutable.fromJS({
        experiment: experiment
      })
    });

    sharedActionExamples({
      action: actions.win,
      type: constants.WIN,
      args: {
        experiment: experiment,
        variation: variation_original
      },
      payload: Immutable.fromJS({
        experiment: experiment,
        variation: variation_original
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
      type: constants.RESET,
      state: undefined,
      payload: undefined,
      newState: initialState
    });

    sharedReducerExamples({
      type: constants.LOAD,
      state: undefined,
      payload: Immutable.fromJS({
        experiments: [ experiment ],
        active: { "Test-Name": "Variation #A" }
      }),
      newState: initialState.set('active', Immutable.fromJS({ "Test-Name": "Variation #A" })).set('experiments', Immutable.fromJS([experiment]))
    });

    sharedReducerExamples({
      type: constants.ACTIVATE,
      state: initialState,
      payload: Immutable.fromJS({
        experiment
      }),
      newState: initialState.set('running', Immutable.fromJS({ "Test-Name": 1 }))
    });

    sharedReducerExamples({
      type: constants.DEACTIVATE,
      state: initialState.set('running', Immutable.fromJS({ "Test-Name": 1 })),
      payload: Immutable.fromJS({
        experiment
      }),
      newState: initialState
    });

    sharedReducerExamples({
      type: constants.PLAY,
      state: undefined,
      payload: Immutable.fromJS({
        experiment: experiment,
        variation: variation_a
      }),
      newState: initialState.set('active', Immutable.fromJS({ "Test-Name": "Variation #A" }))
    });

    sharedReducerExamples({
      type: constants.WIN,
      state: undefined,
      payload: Immutable.fromJS({
        experiment: experiment,
        variation: variation_b
      }),
      newState: initialState.set('winners', Immutable.fromJS({ "Test-Name": "Variation #B" }))
    });

  });


  //
  // State Selectors
  //
  describe('selectors', () => {
    it('exists', () => {
      expect(selectors).to.exist;
      expect(selectors).to.be.a('object');
      expect(selectors).to.not.be.blank;
    });

    describe('findExperiment', () => {
      it('exists', () => {
        expect(selectors.findExperiment).to.exist;
        expect(selectors.findExperiment).to.be.a('function');
      });

      it('has the correct experiment', () => {
        const output = selectors.findExperiment({
          reduxAbTest: initialState.set('experiments', Immutable.fromJS([experiment])),
          experimentName: experiment.name
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(experiment);
      });

      it('throws an Error', () => {
        const output = () => selectors.findExperiment({
          reduxAbTest: initialState,
          experimentName: experiment.name
        });
        expect(output).to.throw(Error);
      });
    });

    describe('selectVariation', () => {
      it('exists', () => {
        expect(selectors.selectVariation).to.exist;
        expect(selectors.selectVariation).to.be.a('function');
      });

      it('chooses the active variation from redux store', () => {
        const output = selectors.selectVariation({
          reduxAbTest: initialState.set('experiments', Immutable.fromJS([experiment])).set('active', Immutable.fromJS({"Test-Name": "Variation #B"})),
          experiment: Immutable.fromJS(experiment),
          defaultVariationName: null
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(variation_b);
      });

      it('chooses the defaultVariationName variation', () => {
        const output = selectors.selectVariation({
          reduxAbTest: initialState.set('experiments', Immutable.fromJS([experiment])),
          experiment: Immutable.fromJS(experiment),
          defaultVariationName: "Variation #B"
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(variation_b);
      });

      it('chooses the active variation from localcache', () => {
        cacheStore.setItem(experiment.name, variation_b.name);
        const output = selectors.selectVariation({
          reduxAbTest: initialState.set('experiments', Immutable.fromJS([experiment])),
          experiment: Immutable.fromJS(experiment),
          defaultVariationName: null
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.deep.equal(variation_b);
      });

      it('randomly assigns a variation, ignoring weight=0 records', () => {
        const output = selectors.selectVariation({
          reduxAbTest: initialState.set('experiments', Immutable.fromJS([experiment])),
          experiment: Immutable.fromJS(experiment),
          defaultVariationName: null
        });
        expect(output).to.exist;
        expect(output.toJSON()).to.not.deep.equal(variation_b);
      });
    });

  });

});
