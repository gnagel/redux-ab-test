import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import Experiment from "./experiment";
import Variation from "../variation";
import { initialState } from '../../module';
import { expect, renderContainer, spy } from 'test_helper';


describe('(Container) src/container/experiment/experiment.js', () => {
  let component;
  let props;
  let store;
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
      name: 'Test-experimentName',
      children: [
        <Variation name="Original">Test Original</Variation>,
        <Variation name="Variation B">Test Variation B</Variation>
      ],
      dispatchActivate,
      dispatchDeactivate,
      dispatchPlay,
      dispatchWin
    };
    store = {
      reduxAbTest: initialState.set('experiments', Immutable.fromJS([{
        name: 'Test-experimentName',
        variations: [
          { name: 'Original', weight: 10000 },
          { name: 'Variation B', weight: 0 }
        ]
      }])).set('active', Immutable.fromJS({ 'Test-experimentName': 'Variation B' }))
    };
    component = renderContainer(Experiment, props, store);
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

  it('calls dispatchActivate', () => {
    expect(dispatchActivate).to.have.been.called;
  });

  it('calls dispatchPlay', () => {
    expect(dispatchPlay).to.have.been.called;
  });

  it('didnt call dispatchWin', () => {
    expect(dispatchWin).to.not.have.been.called;
  });

  it('did call dispatchWin', () => {
    props = {
      name: 'Test-experimentName',
      children: [
        <Variation name="Original">Test Original</Variation>,
        <Variation name="Variation B"><button onClick={ () => { this.props.handleWin(); } }>Variation B</button></Variation>
      ],
      dispatchActivate,
      dispatchDeactivate,
      dispatchPlay,
      dispatchWin
    };
    component = renderContainer(Experiment, props, store);
    expect(component.find('button')).to.have.length(1);
    expect(component.find('button')).to.have.text('Variation B');
    // TODO: simulate the onClick event
    //   component.simulate('click');
    //   expect(onWin).to.have.been.called;
  });

  it('creates Ad-hoc experiments');

  it("should update on componentWillReceiveProps");
});
