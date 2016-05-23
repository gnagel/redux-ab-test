import Debugger from './debugger';

import Experiment from './experiment';

import Variation from './variation';

import reduxAbTest, { VariationType, ExperimentType, constants, actions, initialState, reducers, selectors } from './module';

export default {
  /**
   * React Connected components
   */
  Experiment,
  Variation,
  Debugger,
  /**
   * Flow type annotations:
   */
  VariationType,
  ExperimentType,
  /**
   * Redux Reducer
   */
  reduxAbTest,
  reduxAbTestConstants: constants,
  reduxAbTestActions: actions,
  reduxAbTestInitialState: initialState,
  reduxAbTestReducers: reducers,
  reduxAbTestSelectors: selectors
};
