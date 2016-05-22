import React from "react";
import ReactDOMServer from "react-dom/server";
import Immutable from 'immutable';
import Debugger from "./debugger";
import { initialState } from './module';

import { expect, renderContainer } from '../test/test_helper';


describe("Debugger", () => {
  let component;
  let props;
  let store;
  beforeEach(() => {
    props = {};
    store = {
      reduxAbTest: initialState.set('experiments', Immutable.fromJS([{
        name: 'Test-experimentName',
        variations: [
          { name: 'Original', weight: 10000 },
          { name: 'Variation B', weight: 0 },
        ]
      }])).set('active', Immutable.fromJS({ 'Test-experimentName': 'Variation B' }))
    };
    component = renderContainer(Debugger, props, store);
  });

  it('exists', () => {
    expect(component).to.exist;
    expect(component.html()).to.be.present;
  });

  it('has the correct tagName', () => {
    expect(component).to.have.tagName('div');
  });

  it('has the correct text', () => {
    expect(component).to.have.text('1 Active Experiment');
  });

  it('has the visible experiments', () => {
    props = { visible: true };
    component = renderContainer(Debugger, props, store);
    expect(component.find('label')).to.have.length(2);
    expect(component.find('label').first()).to.have.text('Original');
    expect(component.find('label').last()).to.have.text('Variation B');
  });

});
