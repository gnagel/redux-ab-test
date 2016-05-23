import React from 'react';
import { Provider } from 'react-redux';
import Immutable from 'immutable';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import reduxAbTest, { initialState } from '../../../src/module';
import Experiment  from '../../../src/experiment';
import Variation  from '../../../src/variation';
import Note from './Note.jsx';

const reducer = combineReducers({reduxAbTest});
const store = createStore(reducer, {
  reduxAbTest: initialState.set('experiments', Immutable.fromJS([
    {
      name: "Experiment 1",
      variations: [
        { name: "A" },
        { name: "B" },
      ]
    },
    {
      name: "Experiment 2",
      variations: [
        { name: "X" },
        { name: "Y" },
      ]
    }
  ]))
});


export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <div>
          <Note />
          <h1>Experiment 1</h1>
          <Experiment name="Experiment 1">
            <Variation name="A">
              <h2>Variation A</h2>
            </Variation>
            <Variation name="B">
              <h2>Variation B</h2>
            </Variation>
          </Experiment>
          <h1>Experiment 2</h1>
          <Experiment name="Experiment 2">
            <Variation name="X">
              <h2>Variation X</h2>
            </Variation>
            <Variation name="Y">
              <h2>Variation Y</h2>
            </Variation>
          </Experiment>
        </div>
      </Provider>
    );
  }
}
