import Debugger from './containers/debugger';
import Experiment from './containers/experiment';
import Variation from './containers/variation';

import { VariationType, ExperimentType } from './interfaces';
import reduxAbTest, { initialState, middleware, reset, load, WIN, PLAY } from './module';

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
  reduxAbTestMiddleware:   middleware,
  /**
   * Redux Action Creators
   */
  reset,
  load,
  /**
   * Redux Action Types
   */
  WIN,
  PLAY,
};
