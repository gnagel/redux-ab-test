import React from 'react'; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { spy } from 'sinon';
import reduxAbTest, { initialState } from '../../module';
import LoadedComponent from './loaded-component';
import Variation from './variation';

describe.only('src/components/experiments2/loaded-component.js', () => {
  let component;
  let tree;

  describe('plain text', () => {
    beforeEach(() => {
      component = renderer.create(
        <Provider store={createStore(reduxAbTest, { reduxAbTest: initialState })}>
          <LoadedComponent
            experimentName='Test experiment'
            variationName='Test variation'
            experiment={null}
            variation={null}
            play={spy()}
            activate={spy()}
            deactivate={spy()}
            >
            <Variation name='Test variation'>
              Testing some text
            </Variation>
            <Variation name='Test other variation'>
              Testing some differient text
            </Variation>
          </LoadedComponent>
        </Provider>
      );
      tree = component.toJSON();
    });

    it('exists', () => {
      expect(component).not.toBeUndefined;
    });

    it('has the correct text', () => {
      expect(tree).toMatchSnapshot();
      expect(tree.children).toEqual(['Testing some text']);
    });

    it('has the correct tagName', () => {
      expect(tree).toMatchSnapshot();
      expect(tree.type).toEqual('span');
    });
  });

  describe.skip('component children', () => {
    beforeEach(() => {
      component = renderer.create(
        <Provider store={createStore(reduxAbTest, { reduxAbTest: initialState })}>
          <LoadedComponent
            experimentName='Test experiment'
            variationName='Test variation'
            experiment={Immutable.Map({ name: 'Test experiment' })}
            variation={Immutable.Map({ name: 'Test variation' })}
            >
            <Variation name='Test variation'>
              <div>Testing some text</div>
            </Variation>
            <Variation name='Test other variation'>
              <div>Testing some differient text</div>
            </Variation>
          </LoadedComponent>
        </Provider>
      );
      tree = component.toJSON();
    });

    it('exists', () => {
      expect(component).not.toBeUndefined;
    });

    it('has the correct text', () => {
      expect(tree).toMatchSnapshot();
      expect(tree.children).toEqual(['Testing some text']);
    });

    it('has the correct tagName', () => {
      expect(tree).toMatchSnapshot();
      expect(tree.type).toEqual('div');
    });
  });
});
