import React from 'react'; // eslint-disable-line no-unused-vars
import { Variation } from './variation';
import { initialState } from '../../module';
import { expect, renderComponent } from '../../../test/test_helper';



describe('(Component) src/components/variation/variation.js', () => {
  let component;
  let props;
  beforeEach(() => {
    const reduxAbTest = initialState.merge({
      'experiments': [
        {
          id:         'test-experimentId',
          name:       'Test-experimentName',
          variations: [
            { id: 'test-id-original',    name: 'Original',    weight: 10000 },
            { id: 'test-id-variation-b', name: 'Variation B', weight: 0 },
          ],
        },
      ],
      'active': { 'Test-experimentName': 'Variation B' },
    });

    props = {
      name:       'Variation B',
      experiment: reduxAbTest.getIn(['experiments', 0]),
      children:   'Test-children',
      reduxAbTest,
    };
    component = renderComponent(Variation, props);
  });

  it('exists', () => {
    expect(component).to.exist;
  });

  it('has the correct props', () => {
    expect(component).to.have.prop('name', 'Variation B');
    expect(component).to.have.prop('experiment');
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
