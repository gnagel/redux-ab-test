import React from 'react'; //eslint-disable-line
import { Provider } from 'react-redux'; //eslint-disable-line
import { createStore, combineReducers, applyMiddleware } from 'redux';

import reduxAbTest, { initialState } from '../src/module';

const reducer = combineReducers({reduxAbTest});
const createReduxAbTestStore = (_state = {}) => applyMiddleware()(createStore)(reducer, { reduxAbTest: initialState.mergeDeep(_state) });
export default createReduxAbTestStore;

export const decorateStore = (_state = {}) => {
  return (story) => {
    return (<Provider store={createStore(_state)}>{story()}</Provider>);
  };
};
