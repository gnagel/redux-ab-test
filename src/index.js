import Debugger from './containers/debugger';
import Experiment from './containers/experiment';
import Variation from './containers/variation';

import reduxAbTest, { initialState, middleware, reset, load, setActive, setAudience, WIN, PLAY } from './module';


export default {
  /**
   * React Connected components
   */
  Experiment,
  Variation,
  Debugger,
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
  setActive,
  setAudience,
  /**
   * Redux Action Types
   */
  WIN,
  PLAY,
};
