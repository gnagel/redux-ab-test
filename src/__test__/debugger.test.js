import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { Debugger } from "../index";
import { reduxAbTestInitialState } from '../index';

import { expect, renderContainer } from 'test_helper';


describe("__TEST__/Debugger", () => {
  let component;
  let props;
  let store;
  beforeEach(() => {
    props = {};
    store = {
      reduxAbTest: reduxAbTestInitialState.set('experiments', Immutable.fromJS([{
        name: 'Test-experimentName',
        variations: [
          { name: 'Original', weight: 10000 },
          { name: 'Variation B', weight: 0 }
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

});
