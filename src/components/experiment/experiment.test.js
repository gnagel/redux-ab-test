import React from "react"; // eslint-disable-line no-unused-vars
import Experiment from "./experiment";
import Variation from "../../containers/variation";
import { initialState } from '../../module';
import { expect, renderContainer, spy } from 'test_helper';


const reduxAbTest = initialState.merge({
  'availableExperiments': {
    '': {
      'Test-experimentName': {
        name:       'Test-experimentName',
        variations: [
          { name: 'Original', weight: 10000 },
          { name: 'Variation B', weight: 0 }
        ],
      },
    },
  },
  'active': { 'Test-experimentName': 'Variation B' }
});

describe.skip('(Component) src/components/experiment/experiment.js', () => {
  let component;
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
      reduxAbTest,
      name:     'Test-experimentName',
      children: [
        <Variation name="Original">Test Original</Variation>,
        <Variation name="Variation B">Test Variation B</Variation>
      ],
      dispatchActivate,
      dispatchDeactivate,
      dispatchPlay,
      dispatchWin
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

  it('has 1x rendered variation', () => {
    expect(component.find(Variation)).to.have.length(1);
    expect(component.find(Variation)).to.have.tagName('span');
    expect(component.find(Variation)).to.have.prop('name', 'Variation B');
    expect(component.find(Variation)).to.have.prop('experiment');
    expect(component.find(Variation)).to.have.prop('variation');
    expect(component.find(Variation)).to.have.text('Test Variation B');
  });

  it('wraps the text children in a Variation', () => {
    props['children'] = 'Testing a single child';
    component = renderContainer(Experiment, props, { reduxAbTest }).find(Experiment);
    expect(component).to.exist;
    expect(component.find(Variation)).to.have.length(1);
    expect(component.find(Variation)).to.have.tagName('span');
    expect(component.find(Variation)).to.have.prop('experiment');
    expect(component.find(Variation)).to.have.prop('variation');
  });

  it('wraps the component children in a Variation', () => {
    props['children'] = <div>Testing a single child</div>;
    component = renderContainer(Experiment, props, { reduxAbTest }).find(Experiment);
    expect(component).to.exist;
    expect(component.find(Variation)).to.have.length(1);
    expect(component.find(Variation)).to.have.tagName('div');
    expect(component.find(Variation)).to.have.prop('experiment');
    expect(component.find(Variation)).to.have.prop('variation');
  });

  it('creates Ad-hoc experiments');

  it("should update on componentWillReceiveProps");

  describe('find by :id', () => {
    const reduxAbTest = initialState.merge({
      'availableExperiments': {
        'Test-id': {
          id:         'Test-id',
          name:       'Test-experimentName',
          variations: [
            { name: 'Original', weight: 10000 },
            { name: 'Variation B', weight: 0 }
          ],
        },
      },
      'active': { 'Test-id': 'Variation B' }
    });

    beforeEach(() => {
      props = {
        reduxAbTest,
        id: 'Test-id',
        children: [
          <Variation name="Original">Test Original</Variation>,
          <Variation name="Variation B">Test Variation B</Variation>
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
    const reduxAbTest = initialState.merge({
      availableExperiments: {
        'Example component key selector': {
          'Test-id': {
            id:         'Test-id',
            name:       'Test-experimentName',
            component: {
              key: 'Example component key selector',
            },
            variations: [
              { name: 'Original', weight: 10000 },
              { name: 'Variation B', weight: 0 }
            ],
          },
        },
      },
      active: { 'Test-id': 'Variation B' },
      key_path: ['component', 'key'],
    });

    beforeEach(() => {
      props = {
        reduxAbTest,
        selector: 'Example component key selector',
        children: [
          <Variation name="Original">Test Original</Variation>,
          <Variation name="Variation B">Test Variation B</Variation>
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
