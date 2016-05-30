import React from "react"; // eslint-disable-line no-unused-vars
import { expect } from 'test_helper';

import { VariationType, ExperimentType, WrapsExperimentType, WrapsExperimentVariationType, recievesExperiment, recievesExperimentVariation } from "./index";

describe("index.js", () => {

  it('VariationType exists', () => {
    expect(VariationType).to.exist;
  });

  it('ExperimentType exists', () => {
    expect(ExperimentType).to.exist;
  });

  it('WrapsExperimentType exists', () => {
    expect(WrapsExperimentType).to.exist;
  });

  it('WrapsExperimentVariationType exists', () => {
    expect(WrapsExperimentVariationType).to.exist;
  });

  it('recievesExperiment exists', () => {
    expect(recievesExperiment).to.exist;
  });

  it('recievesExperimentVariation exists', () => {
    expect(recievesExperimentVariation).to.exist;
  });

});
