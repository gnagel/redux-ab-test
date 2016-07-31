import React from "react"; // eslint-disable-line no-unused-vars
import Experiment from "./experiment";
import Variation from "../../containers/variation";
import { initialState } from '../../module';
import { expect, renderContainer, spy } from 'test_helper';


const reduxAbTest = initialState.merge({
  'availableExperiments': {
    'Test-experimentName': {
      name:       'Test-experimentName',
      variations: {
        'Original':    { name: 'Original', weight: 10000 },
        'Variation B': { name: 'Variation B', weight: 0 }
      },
    },
  },
  'active': { 'Test-experimentName': 'Variation B' }
});

describe('(Component) src/components/experiment/experiment.js', () => {
  let component;
  let props;
  let onActivate;
  let onDeactivate;
  let onPlay;
  let onWin;
  // Action Creator callback: Function({experiment:ExperimentType})
  let dispatchActivate;
  // Action Creator callback: Function({experiment:ExperimentType})
  let dispatchDeactivate;
  // Action Creator callback: Function({experiment:ExperimentType, variation:VariationType})
  let dispatchPlay;
  // Action Creator callback: Function({experiment:ExperimentType, variation:VariationType})
  let dispatchWin;

  beforeEach(() => {
    onActivate = spy();
    onDeactivate = spy();
    onPlay = spy();
    onWin = spy();
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
      onActivate,
      onDeactivate,
      onPlay,
      onWin,
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

  it('calls onActivate', () => {
    expect(onActivate).to.have.been.called;
  });

  it('calls onPlay', () => {
    expect(onPlay).to.have.been.called;
  });

  it('didnt call onWin', () => {
    expect(onWin).to.not.have.been.called;
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
});
