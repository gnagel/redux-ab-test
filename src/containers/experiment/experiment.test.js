import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import Experiment, { mapStateToProps, mapDispatchToProps } from "./experiment";
import Variation from '../variation';
import { initialState } from '../../module';
import { expect, renderContainer, spy } from 'test_helper';


describe('(Container) Experiment', () => {
  describe('mapStateToProps', () => {
    it('exists', () => {
      expect(mapStateToProps).to.exist;
    });
    it('has correct keys', () => {
      expect(mapStateToProps({reduxAbTest: 'test-state'})).to.have.keys(['reduxAbTest']);
    });
    it('has correct state', () => {
      expect(mapStateToProps({reduxAbTest: 'test-state'})).to.deep.equal({reduxAbTest: 'test-state'});
    });
  });

  describe('mapDispatchToProps', () => {
    it('exists', () => {
      expect(mapDispatchToProps).to.exist;
    });
    it('has correct keys', () => {
      const dispatch = spy();
      expect(mapDispatchToProps(dispatch)).to.have.keys(['dispatchActivate', 'dispatchDeactivate', 'dispatchPlay', 'dispatchWin', 'dispatchRegisterAdhoc']);
    });
  });

  describe('component', () => {
    let component;
    beforeEach(() => {
      const props = {
        name:     'Test-experimentName',
        children: [
          <Variation name="Original">Test Original</Variation>,
          <Variation name="Variation B">Test Variation B</Variation>
        ],
      };
      const store = {
        reduxAbTest: initialState.set('experiments', Immutable.fromJS([{
          name:       'Test-experimentName',
          variations: [
            { name: 'Original', weight: 10000 },
            { name: 'Variation B', weight: 0 }
          ]
        }]))
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
  });
});
