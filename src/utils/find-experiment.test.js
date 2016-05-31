import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect } from 'test_helper';

import findExperiment from './find-experiment';

describe('utils/find-experiment.js', () => {
  const initialState = Immutable.fromJS({
    experiments: [],
    plays: {},
    active: {},
    winners: {}
  });

  const experiment:ExperimentType = {
    name: "Test-Name",
    variations: [
      { name: "Original", weight: 5000 },
      { name: "Variation #A", weight: 5000 },
      { name: "Variation #B", weight: 0 }
    ]
  };


  it('exists', () => {
    expect(findExperiment).to.exist;
    expect(findExperiment).to.be.a('function');
  });

  it('has the correct experiment', () => {
    const output = findExperiment({
      reduxAbTest: initialState.merge({experiments: [experiment]}),
      experimentName: experiment.name
    });
    expect(output).to.exist;
    expect(output.toJSON()).to.deep.equal(experiment);
  });

  it('throws an Error', () => {
    const output = () => findExperiment({
      reduxAbTest: initialState,
      experimentName: experiment.name
    });
    expect(output).to.throw(Error);
  });
});
