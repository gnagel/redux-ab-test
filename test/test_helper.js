
// Core React libraries:
import React from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';

// Core testing libraries
import chai, { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import chaiEnzyme from 'chai-enzyme';
chai.use(chaiEnzyme()); // Note the invocation at the end

import reduxAbTest from '../src/module';
const reducer = combineReducers({reduxAbTest});


function renderContainer(ComponentClass, props, state) {
  const store = createStore(reducer, state);
  return mount(
    <Provider store={store}>
      <ComponentClass {...props} />
    </Provider>
  );
}

// Build 'renderContainer' helper that should render a given react class
// wired up with the redux-store
function renderComponent(ComponentClass, props) {
  return mount(<ComponentClass {...props} />);
}

class WrapsStatelessComponent extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  render() {
    return <div>{this.props.children}</div>;
  }
}

function renderStatelessComponent(ComponentClass, props) {
  return mount(<WrapsStatelessComponent><ComponentClass {...props} /></WrapsStatelessComponent>).childAt(0);
}

export default { renderContainer, renderComponent, renderStatelessComponent, expect, shallow, mount };
