import Debugger from './containers/debugger';
import Experiment from './containers/experiment';
import Variation from './containers/variation';

import { VariationType, ExperimentType } from './interfaces';
import reduxAbTest, { initialState, reset, load, activate, deactivate, play, win } from './module';

export default {
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
  reduxAbTestInitialState: initialState,
  /**
   * Redux Action Creators
   */
  reduxAbTestActions: {
    reset,
    load,
  }
};
