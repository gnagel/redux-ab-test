import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { spy } from 'sinon';
import { Experiment } from './experiment';
import Variation from '../variation';
import reduxAbTest, { initialState } from '../../module';

const reduxAbTestState = initialState.merge({
  experiments: [
    {
      name:       'Test-experimentName',
      variations: [
        { name: 'Original', weight: 10000 },
        { name: 'Variation B', weight: 0 },
      ],
    },
  ],
  'availableExperiments': {
    'Test-experimentName': 'Test-experimentName',
  },
  'active': { 'Test-experimentName': 'Variation B' },
});

describe('(Component) src/components/experiment/experiment.js', () => {
  let component;
  let tree;
  let props;
  let dispatchActivate;
  let dispatchDeactivate;
  let dispatchPlay;
  let dispatchWin;

  beforeEach(() => {
    dispatchActivate = spy();
    dispatchDeactivate = spy();
    dispatchPlay = spy();
    dispatchWin = spy();

    props = {
      reduxAbTest: reduxAbTestState,
      name:     'Test-experimentName',
      children: [
        <Variation name="Original">Test Original</Variation>,
        <Variation name="Variation B">Test Variation B</Variation>,
      ],
      experiment: reduxAbTestState.getIn(['experiments', 0]),
      variation:  reduxAbTestState.getIn(['experiments', 0, 'variations', 1]),
      dispatchActivate,
      dispatchDeactivate,
      dispatchPlay,
      dispatchWin,
    };
    component = renderer.create(
      <Provider store={createStore(reduxAbTest, { reduxAbTest: reduxAbTestState })}>
        <Experiment {...props} />
      </Provider>
    );
    tree = component.toJSON();
  });

  it('exists', () => {
    expect(component).not.toBeUndefined;
  });

  it('has 1x rendered Experiment', () => {
    expect(tree).toMatchSnapshot();
    expect(tree.type).toEqual('span');
    expect(tree.children).toEqual(['Test Variation B']);
  });

  it('has 1x rendered variation', () => {
    expect(tree).toMatchSnapshot();
    expect(tree.type).toEqual('span');
    expect(tree.props['data-experiment-id']).toBeUndefined;
    expect(tree.props['data-experiment-name']).toEqual('Test-experimentName');
    expect(tree.props['data-variation-id']).toBeUndefined;
    expect(tree.props['data-variation-name']).toEqual('Variation B');
    expect(tree.children).toEqual(['Test Variation B']);
  });

  it('wraps the text children in a Variation', () => {
    props['children'] = 'Testing a single child';
    component = renderer.create(
      <Provider store={createStore(reduxAbTest, { reduxAbTest: reduxAbTestState })}>
        <Experiment {...props} />
      </Provider>
    );
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    expect(tree.type).toEqual('span');
    expect(tree.props['data-experiment-id']).toBeUndefined;
    expect(tree.props['data-experiment-name']).toEqual('Test-experimentName');
    expect(tree.props['data-variation-id']).toBeUndefined;
    expect(tree.props['data-variation-name']).toEqual('Variation B');
    expect(tree.children).toEqual(['Testing a single child']);
  });

  it('wraps the component children in a Variation', () => {
    props['children'] = <div>Testing a single child</div>;
    component = renderer.create(
      <Provider store={createStore(reduxAbTest, { reduxAbTest: reduxAbTestState })}>
        <Experiment {...props} />
      </Provider>
    );
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    expect(component).not.toBeUndefined;
    expect(tree.type).toEqual('div');
    expect(tree.props['data-experiment-id']).toBeUndefined;
    expect(tree.props['data-experiment-name']).toEqual('Test-experimentName');
    expect(tree.props['data-variation-id']).toBeUndefined;
    expect(tree.props['data-variation-name']).toEqual('Variation B');
    expect(tree.children).toEqual(['Testing a single child']);
  });

  it('renders null on blank children', () => {
    props['children'] = [];
    component = renderer.create(
      <Provider store={createStore(reduxAbTest, { reduxAbTest: reduxAbTestState })}>
        <Experiment {...props} />
      </Provider>
    );
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    expect(component).not.toBeUndefined;
    expect(tree).toBeNull;
  });

  it('creates Ad-hoc experiments');

  it('should update on componentWillReceiveProps');

  describe.skip('find by :id', () => {
    const reduxAbTestState = initialState.merge({
      experiments: [
        {
          id:         'Test-id',
          name:       'Test-experimentName',
          variations: [
            { name: 'Original', weight: 10000 },
            { name: 'Variation B', weight: 0 },
          ],
        },
      ],
      'availableExperiments': { 'Test-id': 'Test-id' },
      'active':               { 'Test-id': 'Variation B' },
    });

    beforeEach(() => {
      props = {
        reduxAbTest: reduxAbTestState,
        id:       'Test-id',
        children: [
          <Variation name="Original">Test Original</Variation>,
          <Variation name="Variation B">Test Variation B</Variation>,
        ],
        dispatchActivate,
        dispatchDeactivate,
        dispatchPlay,
        dispatchWin,
      };
      component = renderer.create(
        <Provider store={createStore(reduxAbTest, { reduxAbTest: reduxAbTestState })}>
          <Experiment {...props} />
        </Provider>
      );
      tree = component.toJSON();
    });

    it('exists', () => {
      expect(component).not.toBeUndefined;
      expect(component.html()).to.be.present;
    });

    it('has 1x rendered Experiment', () => {
      expect(component.find(Experiment)).to.have.length(1);
      expect(tree.type).toEqual('span');
      expect(tree.children).toEqual('Test Variation B');
    });
  });

  describe.skip('find by :selector', () => {
    const reduxAbTestState = initialState.merge({
      experiments: [
        {
          id:        'Test-id',
          name:      'Test-experimentName',
          component: {
            key: 'Example component key selector',
          },
          variations: [
            { name: 'Original', weight: 10000 },
            { name: 'Variation B', weight: 0 },
          ],
        },
      ],
      availableExperiments: {
        'Example component key selector': 'Test-id',
      },
      active:   { 'Test-id': 'Variation B' },
      key_path: ['component', 'key'],
    });

    beforeEach(() => {
      props = {
        reduxAbTest: reduxAbTestState,
        selector: 'Example component key selector',
        children: [
          <Variation name="Original">Test Original</Variation>,
          <Variation name="Variation B">Test Variation B</Variation>,
        ],
        dispatchActivate,
        dispatchDeactivate,
        dispatchPlay,
        dispatchWin,
      };
      component = renderer.create(
        <Provider store={createStore(reduxAbTest, { reduxAbTest: reduxAbTestState })}>
          <Experiment {...props} />
        </Provider>
      );
      tree = component.toJSON();
    });

    it('exists', () => {
      expect(component).not.toBeUndefined;
      expect(component.html()).to.be.present;
    });

    it('has 1x rendered Experiment', () => {
      expect(component.find(Experiment)).to.have.length(1);
      expect(tree.type).toEqual('span');
      expect(tree.children).toEqual('Test Variation B');
    });

  });
});
