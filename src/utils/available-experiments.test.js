import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect, spy } from 'test_helper';
import { initialState } from '../module';
import availableExperiments, { matchesField, matchesAudience } from './available-experiments';

const experiment = Immutable.fromJS({
  name:       "No Audience",
  variations: [
    { name: "Original", weight: 5000 },
    { name: "Variation #A", weight: 5000 },
    { name: "Variation #B", weight: 0 }
  ],
});

const experiment_a = Immutable.fromJS({
  name:       "Blank Audience",
  audienceProps: {},
  variations: [
    { name: "Original", weight: 5000 },
    { name: "Variation #A", weight: 5000 },
    { name: "Variation #B", weight: 0 }
  ],
});

const experiment_b = Immutable.fromJS({
  name:       "Simple Audience Type",
  audienceProps: {
    type: "vip",
  },
  variations: [
    { name: "Original", weight: 5000 },
    { name: "Variation #A", weight: 5000 },
    { name: "Variation #B", weight: 0 }
  ],
});

const experiment_c = Immutable.fromJS({
  name:       "Complex Audience Type",
  audienceProps: {
    type:   "vip",
    orders: { '>=' : 1 },
    state:  { 'in': [ 'NY', 'FL', 'CA' ] },
  },
  variations: [
    { name: "Original", weight: 5000 },
    { name: "Variation #A", weight: 5000 },
    { name: "Variation #B", weight: 0 }
  ],
});


describe('utils/available-experiments.js', () => {
  describe('matchesField', () => {
    it('exists', () => {
      expect(matchesField).to.exist;
      expect(matchesField).to.be.a('function');
    });

    it('has the correct output for ===', () => {
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', '===', 10)).to.be.true;
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', '===', 0)).to.be.false;
    });

    it('has the correct output for >=', () => {
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', '>=', 10)).to.be.true;
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', '>=', 11  )).to.be.false;
    });

    it('has the correct output for >', () => {
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', '>', 9)).to.be.true;
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', '>', 10)).to.be.false;
    });

    it('has the correct output for <=', () => {
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', '<=', 10)).to.be.true;
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', '<=', 9)).to.be.false;
    });

    it('has the correct output for <', () => {
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', '<', 11)).to.be.true;
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', '<', 10)).to.be.false;
    });

    it('has the correct output for in', () => {
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', 'in', [9, 10, 11])).to.be.true;
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', 'in', [0])).to.be.false;
    });

    it('has the correct output for not in', () => {
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', 'not in', [1])).to.be.true;
      expect(matchesField(Immutable.Map({ orders: 10}), 'orders', 'not in', [10])).to.be.false;
    });

  });

  describe('matchesAudience', () => {
    it('exists', () => {
      expect(matchesAudience).to.exist;
      expect(matchesAudience).to.be.a('function');
    });

    it('undefined matches any audience', () => {
      expect(matchesAudience(Immutable.Map(), experiment.get('audienceProps'))).to.be.true;
      expect(matchesAudience(Immutable.Map({ type: 'vip' }), experiment.get('audienceProps'))).to.be.true;
      expect(matchesAudience(Immutable.Map({ type: 'vip', orders: 10 }), experiment.get('audienceProps'))).to.be.true;
    });

    it('empty hash matches any audience', () => {
      expect(matchesAudience(Immutable.Map(), experiment_a.get('audienceProps'))).to.be.true;
      expect(matchesAudience(Immutable.Map({ type: 'vip' }), experiment_a.get('audienceProps'))).to.be.true;
      expect(matchesAudience(Immutable.Map({ type: 'vip', orders: 10 }), experiment_a.get('audienceProps'))).to.be.true;
    });

    it('exactly matches vip audience', () => {
      expect(matchesAudience(Immutable.Map(), experiment_b.get('audienceProps'))).to.be.false;
      expect(matchesAudience(Immutable.Map({ type: 'vip' }), experiment_b.get('audienceProps'))).to.be.true;
      expect(matchesAudience(Immutable.Map({ type: 'vip', orders: 10 }), experiment_b.get('audienceProps'))).to.be.true;
    });

    it('exactly matches vip audience with orders and state', () => {
      expect(matchesAudience(Immutable.Map(), experiment_c.get('audienceProps'))).to.be.false;
      expect(matchesAudience(Immutable.Map({ type: 'vip' }), experiment_c.get('audienceProps'))).to.be.false;
      expect(matchesAudience(Immutable.Map({ type: 'vip', orders: 10 }), experiment_c.get('audienceProps'))).to.be.false;
      expect(matchesAudience(Immutable.Map({ type: 'vip', orders: 10, state: 'N/A' }), experiment_c.get('audienceProps'))).to.be.false;
      expect(matchesAudience(Immutable.Map({ type: 'vip', orders: 10, state: 'CA' }), experiment_c.get('audienceProps'))).to.be.true;
    });
  });

  describe('availableExperiments', () => {
    it('exists', () => {
      expect(availableExperiments).to.exist;
      expect(availableExperiments).to.be.a('function');
    });

    it('undefined/blank matches any audience', () => {
      let output = availableExperiments({
        audience:      Immutable.Map(),
        audience_path: ['audienceProps'],
        experiments:   Immutable.List([experiment, experiment_a, experiment_b, experiment_c]),
      });
      expect(output).to.be.an.instanceOf(Immutable.Map);
      expect(Object.keys(output.toJS())).to.be.have.deep.equal([ 'No Audience', 'Blank Audience' ]);

      output = availableExperiments({
        audience:      Immutable.Map({ type: 'new user' }),
        audience_path: ['audienceProps'],
        experiments:   Immutable.List([experiment, experiment_a, experiment_b, experiment_c]),
      });
      expect(output).to.be.an.instanceOf(Immutable.Map);
      expect(Object.keys(output.toJS())).to.be.have.deep.equal([ 'No Audience', 'Blank Audience' ]);
    });

    it('matches vip', () => {
      const output = availableExperiments({
        audience:      Immutable.Map({ type: 'vip' }),
        audience_path: ['audienceProps'],
        experiments:   Immutable.List([experiment, experiment_a, experiment_b, experiment_c]),
      });
      expect(output).to.be.an.instanceOf(Immutable.Map);
      expect(Object.keys(output.toJS())).to.be.have.deep.equal([ 'No Audience', 'Blank Audience', 'Simple Audience Type' ]);
    });

    it('matches vip and orders', () => {
      const output = availableExperiments({
        audience:      Immutable.Map({ type: 'vip', orders: 10, state: 'NY' }),
        audience_path: ['audienceProps'],
        experiments:   Immutable.List([experiment, experiment_a, experiment_b, experiment_c]),
      });
      expect(output).to.be.an.instanceOf(Immutable.Map);
      expect(Object.keys(output.toJS())).to.be.have.deep.equal([ 'No Audience', 'Blank Audience', 'Simple Audience Type', 'Complex Audience Type' ]);
    });

  });
});
