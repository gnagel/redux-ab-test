import React from "react"; // eslint-disable-line no-unused-vars
import { expect, renderComponent } from 'test_helper';

import { initialState } from '../../module';
import Debugger from "./debugger";


describe('(Component) src/components/debugger/debugger.js', () => {
  let component;
  let props;
  beforeEach(() => {
    props = {
      reduxAbTest: initialState.merge(
        {
          experiments: [{
            name: 'Test-experimentName',
            variations: [
              { name: 'Original', weight: 10000 },
              { name: 'Variation B', weight: 0 }
            ]
          }],
          active: {
            'Test-experimentName': 'Variation B'
          }
        }
      )
    };
    component = renderComponent(Debugger, props);
  });

  it('exists', () => {
    expect(component).to.exist;
    expect(component.html()).to.be.present;
  });

  it('has the correct tagName', () => {
    expect(component).to.have.tagName('div');
  });

});
