import Debugger from './containers/debugger';
import Experiment from './containers/experiment';
import Variation from './containers/variation';

import reduxAbTest, { initialState, middleware, reset, load, play, win, fulfilled, setActive, setAudience, setLocation, WIN, PLAY, FULFILLED } from './module';


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
  play,
  win,
  fulfilled,
  setActive,
  setAudience,
  setLocation,
  /**
   * Redux Action Types
   */
  WIN,
  PLAY,
  FULFILLED,
};
