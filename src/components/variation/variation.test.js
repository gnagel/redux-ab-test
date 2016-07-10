import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import Variation from "./variation";

import { expect, renderComponent } from 'test_helper';

describe.only('(Component) src/components/variation/variation.js', () => {
  let component;
  let props;
  beforeEach(() => {
    props = {
      id:         'test-id',
      name:       'Test-name',
      experiment: Immutable.Map({ id: 'test-experimentId', name: 'test-experimentName' }),
      children:   'Test-children',
    };
    component = renderComponent(Variation, props);
  });

  it('exists', () => {
    expect(component).to.exist;
  });

  it('has the correct props', () => {
    expect(component).to.have.prop('id', 'test-id');
    expect(component).to.have.prop('name', 'Test-name');
    expect(component).to.have.prop('children', 'Test-children');
    expect(component).to.have.prop('experiment');
  });

  it('has the correct text', () => {
    expect(component).to.have.text('Test-children');
  });

  it('has the data* attributes', () => {
    expect(component).to.have.data('variation-id', 'test-id');
    expect(component).to.have.data('variation-name', 'Test-name');
    expect(component).to.have.data('experiment-id', 'test-experimentId');
    expect(component).to.have.data('experiment-name', 'test-experimentName');
  });

  it('has 1x span around the children', () => {
    expect(component).to.have.tagName('span');
    expect(component).to.have.data('variation-id', 'test-id');
    expect(component).to.have.data('variation-name', 'Test-name');
    expect(component).to.have.data('experiment-id', 'test-experimentId');
    expect(component).to.have.data('experiment-name', 'test-experimentName');
    expect(component).to.have.text('Test-children');
  });

  it('has the input children when a valid element', () => {
    props = { ...props, children: (<div id="test-id">Test-children</div>) };
    component = renderComponent(Variation, props);
    expect(component).to.have.tagName('div');
    expect(component).to.have.attr('id', 'test-id');
    expect(component).to.have.data('variation-id', 'test-id');
    expect(component).to.have.data('variation-name', 'Test-name');
    expect(component).to.have.data('experiment-id', 'test-experimentId');
    expect(component).to.have.data('experiment-name', 'test-experimentName');
    expect(component).to.have.text('Test-children');
  });
});
