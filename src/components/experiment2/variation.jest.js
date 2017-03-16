import React from 'react'; // eslint-disable-line no-unused-vars
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import reduxAbTest, { initialState } from '../../module';
import Variation, { mapStateToProps } from './variation';

describe('src/components/experiments2/variation.js', () => {
  let component;
  let tree;

  describe('plain text', () => {
    beforeEach(() => {
      component = renderer.create(
        <Provider store={createStore(reduxAbTest, { reduxAbTest: initialState })}>
          <Variation name='Test variation'>
            Testing some text
          </Variation>
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

  describe('component children', () => {
    beforeEach(() => {
      component = renderer.create(
        <Provider store={createStore(reduxAbTest, { reduxAbTest: initialState })}>
          <Variation name='Test variation'>
            <div>Testing some text</div>
          </Variation>
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
