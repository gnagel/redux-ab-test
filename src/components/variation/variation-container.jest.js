import React from 'react'; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import Variation, { mapStateToProps } from './variation';
import reduxAbTest, { initialState } from '../../module';


describe('(Container) Variation', () => {
  describe('mapStateToProps', () => {
    it('exists', () => {
      expect(mapStateToProps).not.toBeUndefined;
    });
    it('has correct keys', () => {
      expect(Object.keys(mapStateToProps({reduxAbTest: 'test-state'}))).toEqual(['reduxAbTest']);
    });
    it('has correct state', () => {
      expect(mapStateToProps({reduxAbTest: 'test-state'})).toEqual({reduxAbTest: 'test-state'});
    });
  });

  describe('component', () => {
    let component;
    let tree;
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
        }),
      };
      component = renderer.create(
        <Provider store={createStore(reduxAbTest, state)}>
          <Variation {...props} />
        </Provider>
      );
      tree = component.toJSON();
    });

    it('variation has expected props', () => {
      expect(tree).toMatchSnapshot();
      expect(tree.type).toEqual('span');
      expect(tree.props['data-experiment-id']).toBeUndefined;
      expect(tree.props['data-experiment-name']).toEqual('Test-experimentName');
      expect(tree.props['data-variation-id']).toBeUndefined;
      expect(tree.props['data-variation-name']).toEqual('Variation B');
      expect(tree.children).toEqual(['Test Variation B']);
    });
  });
});
