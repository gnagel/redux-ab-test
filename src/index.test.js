
import React from "react"; // eslint-disable-line no-unused-vars
import { expect } from 'test_helper';

import {
  /**
   * React Connected components
   */
  Experiment,
  Variation,
  Debugger,
  /**
   * Flow type interfaces:
   */
  VariationType,
  ExperimentType,
  /**
   * Redux Reducer
   */
  reduxAbTest,
  reduxAbTestInitialState,
  reduxAbTestMiddleware,
  /**
   * Redux Action Creators
   */
  reset,
  load,
  setAudience,
  setActive,
  setLocation,
  /**
   * Redux Action Types
   */
  WIN,
  PLAY,
} from "./index";

describe('(Root) src/index.js', () => {
  it('module export Experiment',              () => { expect(Experiment             ).to.exist; });
  it('module export Variation',               () => { expect(Variation              ).to.exist; });
  it('module export Debugger',                () => { expect(Debugger               ).to.exist; });
  it.skip('module export VariationType',      () => { expect(VariationType          ).to.exist; });
  it.skip('module export ExperimentType',     () => { expect(ExperimentType         ).to.exist; });
  it('module export reduxAbTest',             () => { expect(reduxAbTest            ).to.exist; });
  it('module export reduxAbTestInitialState', () => { expect(reduxAbTestInitialState).to.exist; });
  it('module export reduxAbTestMiddleware',   () => { expect(reduxAbTestMiddleware  ).to.exist; });
  it('module export reset',                   () => { expect(reset                  ).to.exist; });
  it('module export load',                    () => { expect(load                   ).to.exist; });
  it('module export setActive',               () => { expect(setActive              ).to.exist; });
  it('module export setAudience',             () => { expect(setAudience            ).to.exist; });
  it('module export setLocation',             () => { expect(setLocation            ).to.exist; });
  it('module export WIN',                     () => { expect(WIN                    ).to.exist; });
  it('module export PLAY',                    () => { expect(PLAY                   ).to.exist; });
});
