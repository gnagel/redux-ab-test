import React from "react"; // eslint-disable-line no-unused-vars
import { expect } from 'test_helper';

import { Experiment, Variation, Debugger } from "./index";

describe("index.js", () => {

  it('Debugger exists', () => {
    expect(Debugger).to.exist;
  });

  it('Experiment exists', () => {
    expect(Experiment).to.exist;
  });

  it('Variation exists', () => {
    expect(Variation).to.exist;
  });

});
