import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect } from '../../test/test_helper';

import randomVariation, { toWeight, toTotal, toRange, toRanges } from './random-variation';

describe('utils/random-variation.js', () => {
  describe('toWeight', () => {
    it('exists', () => {
      expect(toWeight).to.exist;
    });

    it('has the correct weight', () => {
      expect(toWeight(Immutable.Map({weight: 100}))).to.equal(100);
      expect(toWeight(Immutable.Map({weight: -100}))).to.equal(-100);
    });

    it('has the default weight', () => {
      expect(toWeight(Immutable.Map({}))).to.equal(0);
      expect(toWeight(Immutable.Map({weight: undefined}))).to.equal(0);
    });
  });

  describe('toTotal', () => {
    it('exists', () => {
      expect(toTotal).to.exist;
    });

    it('has the correct total', () => {
      expect(toTotal(Immutable.fromJS([{weight: 100}]))).to.equal(100);
      expect(toTotal(Immutable.fromJS([{weight: 100}, {weight: 200}]))).to.equal(300);
      expect(toTotal(Immutable.fromJS([{weight: 100}, {weight: 200}, {weight: 300}]))).to.equal(600);
    });

    it('has the default total', () => {
      expect(toTotal(Immutable.fromJS([]))).to.equal(0);
    });
  });

  describe('toRange', () => {
    it('exists', () => {
      expect(toRange).to.exist;
    });

    it('has the correct range[0]', () => {
      let list = Immutable.List([]);
      list = toRange(list, 5000);
      expect(list).to.exist;
      expect(list.count()).to.have.eq(1);
      const range = list.last();
      expect(range.first()).to.equal(0);
      expect(range.last()).to.equal(4999);
    });

    it('has the correct range[1]', () => {
      let list = Immutable.List([
        Immutable.Range(0, 5000),
      ]);
      list = toRange(list, 5000);
      expect(list).to.exist;
      expect(list.count()).to.have.eq(2);
      const range = list.last();
      expect(range.first()).to.equal(5000);
      expect(range.last()).to.equal(9999);
    });

    it('has the correct range[2]', () => {
      let list = Immutable.List([
        Immutable.Range(0, 5000),
        Immutable.Range(5000, 10000),
      ]);
      list = toRange(list, 10000);
      expect(list).to.exist;
      expect(list.count()).to.have.eq(3);
      const range = list.last();
      expect(range.first()).to.equal(10000);
      expect(range.last()).to.equal(19999);
    });

    it('has the correct range[3]', () => {
      let list = Immutable.List([
        Immutable.Range(0, 5000),
        Immutable.Range(5000, 10000),
        Immutable.Range(10000, 20000),
      ]);
      list = toRange(list, 0);
      expect(list).to.exist;
      expect(list.count()).to.have.eq(4);
      const range = list.last();
      expect(range.first()).to.be.undefined;
      expect(range.last()).to.be.undefined;
    });
  });

  describe('toRanges', () => {
    it('exists', () => {
      expect(toRanges).to.exist;
    });

    it('has the correct ranges', () => {
      const weights = Immutable.fromJS([
        { weight: 5000 },
        { weight: 5000 },
        { weight: 10000 },
        { weight: 0 },
      ]);
      const ranges = toRanges(weights);
      expect(ranges).to.exist;
      expect(ranges.count()).to.have.eq(4);
      expect(JSON.stringify(ranges.map( i => `${i.first()}/${i.last()}`))).to.be.equal('["0/4999","5000/9999","10000/19999","undefined/undefined"]');
      expect(ranges.get(0).first()).to.equal(0);
      expect(ranges.get(0).last()).to.equal(4999);
      expect(ranges.get(1).first()).to.equal(5000);
      expect(ranges.get(1).last()).to.equal(9999);
      expect(ranges.get(2).first()).to.equal(10000);
      expect(ranges.get(2).last()).to.equal(19999);
      expect(ranges.get(3).first()).to.be.undefined;
      expect(ranges.get(3).last()).to.be.undefined;
    });

    it('has the correct ranges', () => {
      const weights = Immutable.fromJS([
        { weight: 5000 },
        { weight: 5000 },
        { weight: 10000 },
        { weight: 0 },
        { weight: 0 },
        { weight: 0 },
      ]);
      const ranges = toRanges(weights);
      expect(ranges).to.exist;
      expect(ranges.count()).to.have.eq(6);
      expect(JSON.stringify(ranges.map( i => `${i.first()}/${i.last()}`))).to.be.equal('["0/4999","5000/9999","10000/19999","undefined/undefined","undefined/undefined","undefined/undefined"]');
      expect(ranges.get(0).first()).to.equal(0);
      expect(ranges.get(0).last()).to.equal(4999);
      expect(ranges.get(1).first()).to.equal(5000);
      expect(ranges.get(1).last()).to.equal(9999);
      expect(ranges.get(2).first()).to.equal(10000);
      expect(ranges.get(2).last()).to.equal(19999);
      expect(ranges.get(3).first()).to.be.undefined;
      expect(ranges.get(3).last()).to.be.undefined;
      expect(ranges.get(4).first()).to.be.undefined;
      expect(ranges.get(4).last()).to.be.undefined;
      expect(ranges.get(5).first()).to.be.undefined;
      expect(ranges.get(5).last()).to.be.undefined;
    });

    it('has the default ranges', () => {
      const weights = Immutable.fromJS([]);
      const ranges = toRanges(weights);
      expect(ranges.count()).to.equal(0);
    });
  });

  describe('randomVariation', () => {
    const experiment = Immutable.fromJS({
      variations: [
          { name: 'Variation A', weight: 5000 },
          { name: 'Variation B', weight: 5000 },
          { name: 'Original', weight: 10000 },
          { name: 'Variation Disabled', weight: 0 },
      ],
    });

    it('exists', () => {
      expect(randomVariation).to.exist;
    });

    it('sorts the variations by weight descending', () => {
      const output = experiment.get('variations').sortBy(toWeight).reverse();
      expect(output).to.exist;
      expect(output).to.be.an.instanceof(Immutable.List);
      expect(output.get(0).get('name')).to.equal('Original');
      expect(output.get(1).get('name')).to.equal('Variation B');
      expect(output.get(2).get('name')).to.equal('Variation A');
      expect(output.get(3).get('name')).to.equal('Variation Disabled');
    });

    it('returns an Immutable.Map', () => {
      const output = randomVariation(experiment);
      expect(output).to.exist;
      expect(output).to.be.an.instanceof(Immutable.Map);
      expect(output.toJS()).to.have.keys('name', 'weight');
    });

    const sharedContext = (i, variationName) => {
      it(`returns the expected variation for i=${i}`, () => {
        const random = () => i;
        const output = randomVariation(experiment, random);
        expect(output).to.exist;
        expect(output).to.be.an.instanceof(Immutable.Map);
        expect(output.toJS()).to.have.keys('name', 'weight');
        expect(output.get('name')).to.equal(variationName);
      });
    };

    // Returns the variations with weight!=0 when Math.random is within the expected range [0, 1)
    Immutable.Range(0.0, 0.50, 0.05).forEach(i => sharedContext(i, 'Original'));
    Immutable.Range(0.50, 0.75, 0.01).forEach(i => sharedContext(i, 'Variation B'));
    Immutable.Range(0.75, 1.00, 0.01).forEach(i => sharedContext(i, 'Variation A'));

    // Returns the variation with weight=0 when Math.random is outside of the expected range [0,1)
    Immutable.Range(1.00, 1.01, 0.01).forEach(i => sharedContext(i, 'Variation Disabled'));
  });
});
