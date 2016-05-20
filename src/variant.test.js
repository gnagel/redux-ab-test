import React from "react";
import ReactDOM from "react-dom";
import Experiment from "./experiment";
import Variant from "./variant";
import emitter from "./emitter";

import { expect, renderComponent } from '../test/test_helper';
import co from "co";
import UUID from "node-uuid";
import ES6Promise from 'es6-promise';
ES6Promise.polyfill();

class App extends React.Component {
  render() {
    const { name, variantTextA, variantTextB } = this.props;
    return (
      <Experiment name={name} value="A">
        <Variant name="A">{variantTextA}</Variant>
        <Variant name="B">{variantTextB}</Variant>
      </Experiment>
    );
  }
}

describe("Variant", () => {
  let component;
  let props;
  beforeEach(() => {
    props = { name: 'Test-name', children: 'Test-children' };
    component = renderComponent(Variant, props);
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
    component = renderComponent(Variant, props);
    expect(component.find('#test-id')).to.have.length(1);
    expect(component.find('#test-id')).to.have.text('Test-children');
  });

});

describe.skip('Variant: Within an Experiment', () => {
  let component;
  let experimentName;
  let variantTextA;
  let variantTextB;

  beforeEach(() => {
    experimentName = UUID.v4();
    variantTextA = UUID.v4();
    variantTextB = UUID.v4();
  });

  afterEach(() => {
    emitter._reset();
  });

  it("should render text nodes.", () => {
    component = renderComponent(App, { name: experimentName, variantTextA, variantTextB });
    expect(component).to.exist;
    expect(component).to.not.have.text(variantTextA);
  });

  it("should render components.", () => {
    variantTextA = <div id="variant-a" />;
    variantTextB = <div id="variant-b" />;
    component = renderComponent(App, { name: experimentName, variantTextA, variantTextB });

    expect(component).to.exist;
    expect(component.find('#variant-a')).to.have.length(1);
    expect(component.find('#variant-b')).to.have.length(1);
  });

  it("should render arrays of components.", () => {
    variantTextA = [<div id="variant-a" />,<div />];
    variantTextB = [<div id="variant-b" />,<div />];
    component = renderComponent(App, { name: experimentName, variantTextA, variantTextB });

    expect(component).to.exist;
    expect(component.find('#variant-a')).to.have.length(1);
    expect(component.find('#variant-b')).to.have.length(1);
  });
});
