import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect } from 'test_helper';

import toWinningActionTypes, { toTypes } from './experiment-action-types';

describe('utils/winning-action-types.js', () => {
  const experiment:ExperimentType = {
    name: "Test-Name",
    variations: [
      { name: "Original", weight: 5000 },
      { name: "Variation #A", weight: 5000 },
      { name: "Variation #B", weight: 0 }
    ]
  };

  describe('toTypes', () => {
    it('exists', () => {
      expect(toTypes).to.exist;
    });

    it('has the correct type', () => {
      expect(toTypes).to.be.a('function');
    });

    it('has the correct length', () => {
      expect(toTypes(Immutable.Map({}), ['win_action_types'])).to.be.an.instanceof(Immutable.Map);
      expect(toTypes(Immutable.Map({}), ['win_action_types']).toJS()).to.deep.equal({});
    });

    it('has the default output', () => {
      let output = toTypes(Immutable.fromJS(experiment), ['win_action_types']);
      expect(output.toJS()).to.deep.equal({});

      output = toTypes(Immutable.fromJS(experiment).merge({win_action_types: []}), ['win_action_types']);
      expect(output.toJS()).to.deep.equal({});
    });

    it('converts the string to an array', () => {
      const output = toTypes(Immutable.fromJS(experiment).merge({
        win_action_types: 'Test/TYPE'
      }), ['win_action_types']);
      expect(output.toJS()).to.deep.equal({
        'Test/TYPE': [ experiment.name ]
      });
    });

    it('has the expected type', () => {
      const output = toTypes(Immutable.fromJS(experiment).merge({
        win_action_types: ['Test/TYPE']
      }), ['win_action_types']);
      expect(output.toJS()).to.deep.equal({
        'Test/TYPE': [ experiment.name ]
      });
    });

    it('has the expected types', () => {
      const output = toTypes(Immutable.fromJS(experiment).merge({
        win_action_types: ['Test/TYPE', 'Another-Type']
      }), ['win_action_types']);
      expect(output.toJS()).to.deep.equal({
        'Test/TYPE': [experiment.name],
        'Another-Type': [experiment.name]
      });
    });
  });


  describe('toWinningActionTypes', () => {
    it('exists', () => {
      expect(toWinningActionTypes).to.exist;
    });

    it('has the correct type', () => {
      expect(toWinningActionTypes).to.be.a('function');
    });

    it('has the correct output type', () => {
      const output = toWinningActionTypes({ experiments: Immutable.fromJS([]), path: ['win_action_types'] });
      expect(output).to.be.an.instanceof(Immutable.Map);
    });

    it('has the correct length', () => {
      const output = toWinningActionTypes({ experiments: Immutable.fromJS([]), path: ['win_action_types'] });
      expect(output.toJS()).to.have.be.empty;
    });

    it('has the default output', () => {
      let output = toWinningActionTypes({ experiments: Immutable.fromJS([]), path: ['win_action_types'] });
      expect(output.toJS()).to.deep.equal({});

      output = toWinningActionTypes({ experiments: Immutable.fromJS([experiment]), path: ['win_action_types'] });
      expect(output.toJS()).to.deep.equal({});

      output = toWinningActionTypes({ experiments: Immutable.fromJS([ {...experiment, win_action_types: []} ]), path: ['win_action_types'] });
      expect(output.toJS()).to.deep.equal({});
    });

    it('has the expected type', () => {
      const experiments = Immutable.fromJS([
        {...experiment, win_action_types: ['Test/TYPE']}
      ]);
      const output = toWinningActionTypes({experiments, path: ['win_action_types']});
      expect(output.toJS()).to.deep.equal({
        'Test/TYPE': [ experiment.name ]
      });
    });

    it('has the expected types', () => {
      const experiments = Immutable.fromJS([
        {...experiment, win_action_types: ['Test/TYPE', 'Another-Type']}
      ]);
      const output = toWinningActionTypes({experiments, path: ['win_action_types']});
      expect(output.toJS()).to.deep.equal({
        'Test/TYPE': [experiment.name],
        'Another-Type': [experiment.name]
      });
    });

    it('has the expected types from multiple experiments', () => {
      const experiments = Immutable.fromJS([
        {...experiment, win_action_types: ['Test/TYPE', 'Another-Type']},
        {...experiment, name: 'Test-name2', win_action_types: ['Test/TYPE', 'New-Type']}
      ]);
      const output = toWinningActionTypes({experiments, path: ['win_action_types']});
      expect(output.toJS()).to.deep.equal({
        'Test/TYPE': [experiment.name, 'Test-name2'],
        'New-Type': ['Test-name2'],
        'Another-Type': [experiment.name]
      });
    });
  });

});
