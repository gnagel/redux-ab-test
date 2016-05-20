import React from "react";
import ReactDOM from "react-dom";
import Experiment from "../src/CoreExperiment";
import Variant from "../src/variant";
import emitter from "../src/emitter";

import { expect, renderComponent } from './test_helper';
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

  describe('Within an Experiment', () => {
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
});
