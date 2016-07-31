import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import Variation from "./variation";
import { initialState } from '../../module';
import { expect, renderComponent } from 'test_helper';


const reduxAbTest = initialState.merge({
  'availableExperiments': {
    'Test-experimentName': {
      name:       'Test-experimentName',
      variations: [
        { name: 'Original', weight: 10000 },
        { name: 'Variation B', weight: 0 }
      ]
    },
  },
  'active': { 'Test-experimentName': 'Variation B' }
});

describe('(Component) src/components/variation/variation.js', () => {
  let component;
  let props;
  beforeEach(() => {
    props = {
      name:           'Variation B',
      experimentName: 'Test-experimentName',
      children:       'Test-children',
      reduxAbTest:    initialState.set('experiments', Immutable.fromJS([{
        id:         'test-experimentId',
        name:       'Test-experimentName',
        variations: [
          { id: 'test-id-original', name: 'Original', weight: 10000 },
          { id: 'test-id-variation-b', name: 'Variation B', weight: 0 }
        ]
      }]))
    };
    component = renderComponent(Variation, props);
  });

  it('exists', () => {
    expect(component).to.exist;
  });

  it('has the correct props', () => {
    expect(component).to.have.prop('name', 'Variation B');
    expect(component).to.have.prop('experimentName', 'Test-experimentName');
    expect(component).to.have.prop('reduxAbTest');
  });

  it('has the correct text', () => {
    expect(component).to.have.text('Test-children');
  });

  it('has the correct tagName', () => {
    expect(component).to.have.tagName('span');
  });

  it('wraps the text in a span', () => {
    const child = component.find('span');
    expect(child).to.have.tagName('span');
    expect(child).to.have.text('Test-children');
  });

  it('have the correct data-* props', () => {
    const child = component.find('span');
    expect(child).to.have.prop('data-variation-id', 'test-id-variation-b');
    expect(child).to.have.prop('data-variation-name', 'Variation B');
    expect(child).to.have.prop('data-experiment-id', 'test-experimentId');
    expect(child).to.have.prop('data-experiment-name', 'Test-experimentName');
  });

  it('has the correct data-* attrs', () => {
    const child = component.find('span');
    expect(child).to.have.data('variation-id', 'test-id-variation-b');
    expect(child).to.have.data('variation-name', 'Variation B');
    expect(child).to.have.data('experiment-id', 'test-experimentId');
    expect(child).to.have.data('experiment-name', 'Test-experimentName');
  });

  it('adds the props to the children component', () => {
    props = { ...props, children: (<div id="test-id">Test-children</div>) };
    component = renderComponent(Variation, props);
    expect(component).to.have.tagName('div');
    expect(component).to.have.attr('id', 'test-id');
    expect(component).to.have.data('variation-id', 'test-id-variation-b');
    expect(component).to.have.data('variation-name', 'Variation B');
    expect(component).to.have.data('experiment-id', 'test-experimentId');
    expect(component).to.have.data('experiment-name', 'Test-experimentName');
    expect(component).to.have.text('Test-children');
  });
});
