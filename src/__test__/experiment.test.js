import React from "react";
import ReactDOMServer from "react-dom/server";
import Immutable from 'immutable';
import Experiment, { RawExperiment } from "../experiment";
import Variation from "../variation";
import { initialState } from '../module';

import { expect, renderContainer } from 'test_helper';
import co from "co";
import UUID from "node-uuid";


describe("Experiment", () => {
  let component;
  let props;
  let store;
  beforeEach(() => {
    props = {
      name: 'Test-experimentName',
      children: [
        <Variation name="Original">Test Original</Variation>,
        <Variation name="Variation B">Test Variation B</Variation>,
      ]
    };
    store = {
      reduxAbTest: initialState.set('experiments', Immutable.fromJS([{
        name: 'Test-experimentName',
        variations: [
          { name: 'Original', weight: 10000 },
          { name: 'Variation B', weight: 0 },
        ]
      }])).set('active', Immutable.fromJS({ 'Test-experimentName': 'Variation B' }))
    };
    component = renderContainer(Experiment, props, store);
  });

  it('exists', () => {
    expect(component).to.exist;
    expect(component.html()).to.be.present;
  });

  it('is the Variation\'s contents', () => {
    expect(component).to.not.have.prop('name', 'Variation B');
    expect(component).to.have.tagName('span');
    expect(component).to.have.text('Test Variation B');
  });

  it('updates store.reduxAbTest.running');
  it('updates store.reduxAbTest.active');
  it('updates store.reduxAbTest.winners');
  it('creates Ad-hoc experiments');

  it("should update on componentWillReceiveProps");
});
