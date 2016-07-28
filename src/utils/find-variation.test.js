import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect } from 'test_helper';

import findVariation from './find-variation';

describe('utils/find-variation.js', () => {
  const initialState = Immutable.fromJS({
    experiments: [],
    plays:       {},
    active:      {},
    winners:     {}
  });

  const experiment:ExperimentType = {
    name:       "Test-Name",
    variations: [
      { name: "Original", weight: 5000 },
      { name: "Variation #A", weight: 5000 },
      { name: "Variation #B", weight: 0 }
    ]
  };


  it('exists', () => {
    expect(findVariation).to.exist;
    expect(findVariation).to.be.a('function');
  });

  it('has the correct variation', () => {
    const output = findVariation( Immutable.fromJS(experiment), "Variation #A" );
    expect(output).to.exist;
    expect(output.toJSON()).to.deep.equal({ name: "Variation #A", weight: 5000 });
  });

  it('throws an Error', () => {
    const output = () => findVariation( null, null );
    expect(output).to.throw(Error);
  });

  it('throws an Error', () => {
    const output = () => findVariation( Immutable.fromJS(experiment), 'Not a variation' );
    expect(output).to.throw(Error);
  });
});
