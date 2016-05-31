import React from "react"; // eslint-disable-line no-unused-vars
import Variation from "../variation";

import { expect, renderComponent } from 'test_helper';

describe("__TEST__/Variation", () => {
  let component;
  let props;
  beforeEach(() => {
    props = { name: 'Test-name', children: 'Test-children' };
    component = renderComponent(Variation, props);
  });

  it('exists', () => {
    expect(component).to.exist;
  });

  it('has the correct props', () => {
    expect(component).to.have.prop('name', 'Test-name');
    expect(component).to.have.prop('children', 'Test-children');
  });

  it('has the correct text', () => {
    expect(component).to.have.text('Test-children');
  });

  it('has the correct div+text', () => {
    props = { ...props, children: (<div id="test-id">Test-children</div>) };
    component = renderComponent(Variation, props);
    expect(component.find('#test-id')).to.have.length(1);
    expect(component.find('#test-id')).to.have.text('Test-children');
  });

});
