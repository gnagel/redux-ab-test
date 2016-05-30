import React from "react"; // eslint-disable-line no-unused-vars
import { expect } from 'test_helper';

import Experiment from "./index";

describe("index.js", () => {
  it('Experiment exists', () => {
    expect(Experiment).to.exist;
  });
});
