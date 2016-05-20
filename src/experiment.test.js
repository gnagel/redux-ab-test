import React from "react";
import ReactDOMServer from "react-dom/server";
import Experiment from "./experiment";
import Variant from "./variant";
import emitter from "./emitter";

import { expect, renderComponent } from '../test/test_helper';
import co from "co";
import UUID from "node-uuid";


class App extends React.Component {
  render() {
    const { name } = this.props;
    return (
      <Experiment name={name}>
        <Variant name="A"><div id="variant-a" /></Variant>
        <Variant name="B"><div id="variant-b" /></Variant>
      </Experiment>
    );
  }
}



describe("Experiment", () => {
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



describe.skip("Experiment", () => {
  let component;

  it("should render to a string.", co.wrap(function *(){
    const name = UUID.v4();
    component = renderComponent(App, { name });
    expect(component).to.exist;
  }));

  it("should choose the same variant when a user identifier is defined.", co.wrap(function *(){
    let userIdentifier = UUID.v4();
    let experimentName = UUID.v4();
    let variantNames = [];
    for(let i = 0; i < 100; i++) {
      variantNames.push(UUID.v4());
    }
    let App = React.createClass({
      render: () =>{
        return <Experiment name={experimentName} userIdentifier={userIdentifier}>
          {variantNames.map(name => {
            return <Variant key={name} name={name}><div id={'variant-' + name}></div></Variant>
          })}
        </Experiment>;
      }
    });
    let chosenVariant;
    emitter.once("play", function(experimentName, variantName){
      chosenVariant = variantName;
    });
    let result = ReactDOMServer.renderToString(<App />);
    assert(chosenVariant);
    assert.notEqual(result.indexOf(chosenVariant), -1);
    for(let i = 0; i < 100; i++) {
      emitter._reset();
      result = ReactDOMServer.renderToString(<App />);
      assert.notEqual(result.indexOf(chosenVariant), -1);
    }
  }));
});
