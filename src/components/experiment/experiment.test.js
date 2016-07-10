import React from "react"; // eslint-disable-line no-unused-vars
import Experiment from "./experiment";
import Variation from "../variation";
import { initialState } from '../../module';
import { expect, renderComponent, spy } from 'test_helper';


const reduxAbTest = initialState.merge({
  'experiments': [{
    name:       'Test-experimentName',
    variations: [
      { name: 'Original', weight: 10000 },
      { name: 'Variation B', weight: 0 }
    ]
  }],
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
    component = renderComponent(Experiment, props);
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

  it('calls onActivate', () => {
    expect(onActivate).to.have.been.called;
  });

  it('calls onPlay', () => {
    expect(onPlay).to.have.been.called;
  });

  it('didnt call onWin', () => {
    expect(onWin).to.not.have.been.called;
  });

  it('did call onWin', () => {
    props = {
      ...props,
      children: [
        <Variation name="Original">Test Original</Variation>,
        <Variation name="Variation B"><button onClick={ () => { this.props.handleWin(); } }>Variation B</button></Variation>
      ]
    };
    component = renderComponent(Experiment, props);
    expect(component.find('button')).to.have.length(1);
    expect(component.find('button')).to.have.text('Variation B');
    // TODO: simulate the onClick event
    // component.find('button').simulate('click');
    //   expect(onWin).to.have.been.called;
  });

  it('creates Ad-hoc experiments');

  it("should update on componentWillReceiveProps");
});
