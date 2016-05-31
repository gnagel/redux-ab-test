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
  let onActivate;
  let onDeactivate;
  let onPlay;
  let onWin;
  beforeEach(() => {
    onActivate = spy();
    onDeactivate = spy();
    onPlay = spy();
    onWin = spy();

    props = {
      name: 'Test-experimentName',
      children: [
        <Variation name="Original">Test Original</Variation>,
        <Variation name="Variation B">Test Variation B</Variation>
      ],
      onActivate,
      onDeactivate,
      onPlay,
      onWin
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
      name: 'Test-experimentName',
      children: [
        <Variation name="Original">Test Original</Variation>,
        <Variation name="Variation B"><button onClick={ () => { this.props.handleWin(); } }>Variation B</button></Variation>
      ],
      onActivate,
      onDeactivate,
      onPlay,
      onWin
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
