import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { Variation } from './variation';
import { initialState } from '../../module';



describe('(Component) src/components/variation/variation.js', () => {
  let shallowComponent;
  let component;
  let tree;
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
    shallowComponent = shallow(
      <Variation {...props} />
    );
    component = renderer.create(
      <Variation {...props} />
    );
    tree = component.toJSON();
  });

  it('exists', () => {
    expect(component).not.toBeUndefined;
  });

  it('has the correct props', () => {
    expect(tree).toMatchSnapshot();
    expect(tree.props['data-experiment-id']).toEqual('test-experimentId');
    expect(tree.props['data-experiment-name']).toEqual('Test-experimentName');
    expect(tree.props['data-variation-id']).toEqual('test-id-variation-b');
    expect(tree.props['data-variation-name']).toEqual('Variation B');
  });

  it('has the correct text', () => {
    expect(tree).toMatchSnapshot();
    expect(tree.children).toEqual(['Test-children']);
  });

  it('has the correct tagName', () => {
    expect(tree).toMatchSnapshot();
    expect(tree.type).toEqual('span');
  });

  it('have the correct data-* props', () => {
    expect(tree).toMatchSnapshot();
    expect(tree.props['data-variation-id']).toEqual('test-id-variation-b');
    expect(tree.props['data-variation-name']).toEqual('Variation B');
    expect(tree.props['data-experiment-id']).toEqual('test-experimentId');
    expect(tree.props['data-experiment-name']).toEqual('Test-experimentName');
  });

  it('adds the props to the children component', () => {
    props = { ...props, children: (<div id="test-id">Test-children</div>) };
    component = renderer.create(
      <Variation {...props} />
    );
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    expect(tree.type).toEqual('div');
    expect(tree.props['id']).toEqual('test-id');
    expect(tree.props['data-variation-id']).toEqual('test-id-variation-b');
    expect(tree.props['data-variation-name']).toEqual('Variation B');
    expect(tree.props['data-experiment-id']).toEqual('test-experimentId');
    expect(tree.props['data-experiment-name']).toEqual('Test-experimentName');
    expect(tree.children).toEqual(['Test-children']);
  });
});
