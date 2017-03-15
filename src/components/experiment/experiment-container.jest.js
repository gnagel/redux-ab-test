import React from 'react'; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { spy } from 'sinon';
import Experiment, { mapStateToProps, mapDispatchToProps } from './experiment';
import Variation from '../variation';
import reduxAbTest, { initialState } from '../../module';


describe('(Container) Experiment', () => {
  describe.skip('mapStateToProps', () => {
    it('exists', () => {
      expect(mapStateToProps).not.toBeUndefined;
    });

    it('has correct keys', () => {
      expect(Object.keys(mapStateToProps({reduxAbTest: initialState}, {}))).toEqual(['reduxAbTest', 'experiment', 'variation']);
    });

    it('has correct state', () => {
      const props = {
        name: 'Test-experimentName',
      };
      const store = {
        reduxAbTest: initialState.merge({
          experiments: [
            {
              name:       'Test-experimentName',
              variations: [
                { name: 'Original', weight: 10000 },
                { name: 'Variation B', weight: 0 },
              ],
            },
          ],
          availableExperiments: {
            'Test-experimentName': 'Test-experimentName',
          },
          active: { 'Test-experimentName': 'Variation B' },
        }),
      };
      const output = mapStateToProps(store, props);
      expect(Object.keys(output)).toEqual(['reduxAbTest', 'experiment', 'variation']);
      const experiment = output.experiment;
      const variation = output.variation;
      expect(experiment).not.toBeNull;
      expect(variation).not.toBeNull;
      expect(experiment.toJS()).toEqual(store.reduxAbTest.getIn(['experiments', 0]).toJS());
      expect(variation.toJS()).toEqual(store.reduxAbTest.getIn(['experiments', 0, 'variations', 1]).toJS());
    });


    it('has correct experiment', () => {
      expect(Object.keys(mapStateToProps({reduxAbTest: initialState}, {}))).toEqual(['reduxAbTest', 'experiment', 'variation']);
    });
  });

  describe.skip('mapDispatchToProps', () => {
    it('exists', () => {
      expect(mapDispatchToProps).not.toBeUndefined;
    });
    it('has correct keys', () => {
      const dispatch = spy();
      expect(Object.keys(mapDispatchToProps(dispatch))).toEqual(['dispatchActivate', 'dispatchDeactivate', 'dispatchPlay', 'dispatchWin']);
    });
  });

  it.skip('renders something', () => {
    const experiment = Immutable.fromJS({
      name:       'Test-experimentName',
      id:         'Test-id',
      variations: [
        { name: 'Original', weight: 10000 },
        { name: 'Variation B', weight: 0 },
      ],
    });
    const state = {
      reduxAbTest: initialState.merge({
        experiments: [ experiment ],
        availableExperiments: {
          'Test-experimentName': 'Test-id',
        },
      }),
    };
    const component = renderer.create(
      <Provider store={createStore(reduxAbTest, state)}>
        <Experiment
          selector='Test-experimentName'
          experiment={experiment}
          variation={experiment.getIn(['variations', 1])}
          dispatchActivate={() => { console.log('dispatchActivate!'); }}
          dispatchDeactivate={() => { console.log('dispatchDeactivate!'); }}
          dispatchPlay={() => { console.log('dispatchPlay!'); }}
          dispatchWin={() => { console.log('dispatchWin!'); }}
          >
          <Variation
            name='Original'
            >
            Original Version
          </Variation>
          <Variation
            name='Variation B'
            >
            B Version
          </Variation>
        </Experiment>
      </Provider>
    );
    expect(component).not.toBeUndefined;
  });

  describe.skip('component', () => {
    let component;
    let tree;

    beforeEach(() => {
      const state = {
        reduxAbTest: initialState.merge({
          experiments: [
            {
              name:       'Test-experimentName',
              variations: [
                { name: 'Original', weight: 10000 },
                { name: 'Variation B', weight: 0 },
              ],
            },
          ],
          availableExperiments: {
            'Test-experimentName': 'Test-experimentName',
          },
        }),
      };
      const props = {
        reduxAbTest: state.reduxAbTest,
        name:     'Test-experimentName',
        children: [
          <Variation name="Original">Test Original</Variation>,
          <Variation name="Variation B">Test Variation B</Variation>,
        ],
      };
      component = renderer.create(
        <Provider store={createStore(reduxAbTest, state)}>
          <Experiment {...props} />
        </Provider>
      );
      tree = component.toJSON();
    });

    it.skip('exists', () => {
      expect(component).not.toBeUndefined;
      expect(tree).toMatchSnapshot();
    });

    it.skip('has 1x Variation', () => {
      expect(tree).toMatchSnapshot();
      expect(tree.type).toEqual('span');
      expect(tree.props['data-experiment-id']).toBeUndefined;
      expect(tree.props['data-experiment-name']).toEqual('Test-experimentName');
      expect(tree.props['data-variation-id']).toBeUndefined;
      expect(tree.props['data-variation-name']).toEqual('Variation B');
      expect(tree.children).toEqual(['Test Variation B']);
    });

    describe.skip('find by :id', () => {
      let props;
      let dispatchActivate;
      let dispatchDeactivate;
      let dispatchPlay;
      let dispatchWin;

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
        dispatchActivate = spy();
        dispatchDeactivate = spy();
        dispatchPlay = spy();
        dispatchWin = spy();

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
      let props;
      let dispatchActivate;
      let dispatchDeactivate;
      let dispatchPlay;
      let dispatchWin;

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
        dispatchActivate = spy();
        dispatchDeactivate = spy();
        dispatchPlay = spy();
        dispatchWin = spy();

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
});
