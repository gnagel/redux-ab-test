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

  it('updates store.reduxAbTest.running');
  it('updates store.reduxAbTest.active');
  it('updates store.reduxAbTest.winners');
  it('creates Ad-hoc experiments');

  it("should update on componentWillReceiveProps");
});
