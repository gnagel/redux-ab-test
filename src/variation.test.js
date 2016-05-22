import React from "react";
import ReactDOM from "react-dom";
import Experiment from "./experiment";
import Variation from "./variation";
import emitter from "./emitter";

import { expect, renderComponent } from '../test/test_helper';
import co from "co";
import UUID from "node-uuid";
import ES6Promise from 'es6-promise';
ES6Promise.polyfill();

class App extends React.Component {
  render() {
    const { name, variationTextA, variationTextB } = this.props;
    return (
      <Experiment name={name} value="A">
        <Variation name="A">{variationTextA}</Variation>
        <Variation name="B">{variationTextB}</Variation>
      </Experiment>
    );
  }
}

describe("Variation", () => {
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

describe.skip('Variation: Within an Experiment', () => {
  let component;
  let experimentName;
  let variationTextA;
  let variationTextB;

  beforeEach(() => {
    experimentName = UUID.v4();
    variationTextA = UUID.v4();
    variationTextB = UUID.v4();
  });

  afterEach(() => {
    emitter._reset();
  });

  it("should render text nodes.", () => {
    component = renderComponent(App, { name: experimentName, variationTextA, variationTextB });
    expect(component).to.exist;
    expect(component).to.not.have.text(variationTextA);
  });

  it("should render components.", () => {
    variationTextA = <div id="variation-a" />;
    variationTextB = <div id="variation-b" />;
    component = renderComponent(App, { name: experimentName, variationTextA, variationTextB });

    expect(component).to.exist;
    expect(component.find('#variation-a')).to.have.length(1);
    expect(component.find('#variation-b')).to.have.length(1);
  });

  it("should render arrays of components.", () => {
    variationTextA = [<div id="variation-a" />,<div />];
    variationTextB = [<div id="variation-b" />,<div />];
    component = renderComponent(App, { name: experimentName, variationTextA, variationTextB });

    expect(component).to.exist;
    expect(component.find('#variation-a')).to.have.length(1);
    expect(component.find('#variation-b')).to.have.length(1);
  });
});
