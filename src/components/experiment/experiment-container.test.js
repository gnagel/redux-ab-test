import React from 'react'; // eslint-disable-line no-unused-vars
import Experiment, { mapStateToProps, mapDispatchToProps } from './experiment';
import Variation from '../variation';
import { initialState } from '../../module';
import { expect, renderContainer } from '../../../test/test_helper';
import { spy } from 'sinon';


describe('(Container) Experiment', () => {
  describe('mapStateToProps', () => {
    it('exists', () => {
      expect(mapStateToProps).to.exist;
    });

    it('has correct keys', () => {
      expect(mapStateToProps({reduxAbTest: initialState}, {})).to.have.keys(['reduxAbTest', 'experiment', 'variation']);
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
      expect(output).to.have.keys(['reduxAbTest', 'experiment', 'variation']);
      const experiment = output.experiment;
      const variation = output.variation;
      // console.log(`experiment=${experiment}, output.experiment=${JSON.stringify(output.experiment)}`);
      // console.log(`variation=${variation}, output.variation=${JSON.stringify(output.variation)}`);
      expect(experiment).to.not.be.null;
      expect(variation).to.not.be.null;
      expect(experiment.toJS()).to.deep.equal(store.reduxAbTest.getIn(['experiments', 0]).toJS());
      expect(variation.toJS()).to.deep.equal(store.reduxAbTest.getIn(['experiments', 0, 'variations', 1]).toJS());
    });


    it('has correct experiment', () => {
      expect(mapStateToProps({reduxAbTest: initialState}, {})).to.have.keys(['reduxAbTest', 'experiment', 'variation']);
    });
  });

  describe('mapDispatchToProps', () => {
    it('exists', () => {
      expect(mapDispatchToProps).to.exist;
    });
    it('has correct keys', () => {
      const dispatch = spy();
      expect(mapDispatchToProps(dispatch)).to.have.keys(['dispatchActivate', 'dispatchDeactivate', 'dispatchPlay', 'dispatchWin']);
    });
  });

  describe('component', () => {
    let component;
    beforeEach(() => {
      const props = {
        name:     'Test-experimentName',
        children: [
          <Variation name="Original">Test Original</Variation>,
          <Variation name="Variation B">Test Variation B</Variation>,
        ],
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
        }),
      };
      component = renderContainer(Experiment, props, store);
    });

    it('exists', () => {
      expect(component).to.exist;
      expect(component.html()).to.be.present;
    });

    it('has 1x Variation', () => {
      expect(component.find(Variation)).to.have.length(1);
    });

    describe('find by :id', () => {
      let props;
      let dispatchActivate;
      let dispatchDeactivate;
      let dispatchPlay;
      let dispatchWin;

      const reduxAbTest = initialState.merge({
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
          reduxAbTest,
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
        component = renderContainer(Experiment, props, { reduxAbTest }).find(Experiment);
      });

      it('exists', () => {
        expect(component).to.exist;
        expect(component.html()).to.be.present;
      });

      it('has 1x rendered Experiment', () => {
        expect(component.find(Experiment)).to.have.length(1);
        expect(component).to.have.tagName('span');
        expect(component).to.have.text('Test Variation B');
      });
    });

    describe('find by :selector', () => {
      let props;
      let dispatchActivate;
      let dispatchDeactivate;
      let dispatchPlay;
      let dispatchWin;

      const reduxAbTest = initialState.merge({
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
          reduxAbTest,
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
        component = renderContainer(Experiment, props, { reduxAbTest }).find(Experiment);
      });

      it('exists', () => {
        expect(component).to.exist;
        expect(component.html()).to.be.present;
      });

      it('has 1x rendered Experiment', () => {
        expect(component.find(Experiment)).to.have.length(1);
        expect(component).to.have.tagName('span');
        expect(component).to.have.text('Test Variation B');
      });

    });
  });
});
