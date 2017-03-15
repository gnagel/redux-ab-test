import React from 'react'; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import Variation, { mapStateToProps } from './variation';
import { initialState } from '../../module';
import { expect, renderContainer } from '../../../test/test_helper';


describe('(Container) Variation', () => {
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

  describe('component', () => {
    let component;
    beforeEach(() => {
      const props = {
        name:       'Variation B',
        experiment: Immutable.fromJS({
          name:       'Test-experimentName',
          variations: [
            { name: 'Original',  weight: 10000 },
            { name: 'Variation B', weight: 0 },
          ],
        }),
        children: 'Test Variation B',
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
        }),
      };
      component = renderContainer(Variation, props, store).find(Variation);
    });

    it('exists', () => {
      expect(component).to.exist;
      expect(component.html()).to.be.present;
    });

    it('has 1x Variation', () => {
      expect(component).to.have.length(1);
    });

    it('variation has expected props', () => {
      expect(component).to.have.length(1);
      expect(component).to.have.prop('name', 'Variation B');
      expect(component).to.have.tagName('span');
      expect(component).to.have.text('Test Variation B');
    });
  });
});
