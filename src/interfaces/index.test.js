import React from "react"; // eslint-disable-line no-unused-vars
import { expect } from 'test_helper';

import { VariationType, ExperimentType, WrapsExperimentType, WrapsExperimentVariationType, recievesExperiment, recievesExperimentVariation } from "./index";

describe("index.js", () => {

  it('VariationType exists', () => {
    expect(VariationType).to.be.undefined;
  });

  it('ExperimentType exists', () => {
    expect(ExperimentType).to.be.undefined;
  });

  it('WrapsExperimentType exists', () => {
    expect(WrapsExperimentType).to.be.undefined;
  });

  it('WrapsExperimentVariationType exists', () => {
    expect(WrapsExperimentVariationType).to.be.undefined;
  });

  it('recievesExperiment exists', () => {
    expect(recievesExperiment).to.exist;
    expect(recievesExperiment).to.be.a('function');
  });

  it('recievesExperimentVariation exists', () => {
    expect(recievesExperimentVariation).to.exist;
    expect(recievesExperimentVariation).to.be.a('function');
  });

});
