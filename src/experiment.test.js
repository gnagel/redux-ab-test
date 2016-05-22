import React from "react";
import ReactDOMServer from "react-dom/server";
import Immutable from 'immutable';
import Experiment from "./experiment";
import Variation from "./variation";
import { initialState } from './module';
import emitter from "./emitter";

import { expect, renderContainer } from '../test/test_helper';
import co from "co";
import UUID from "node-uuid";


describe("Experiment", () => {
  let component;
  let props;
  let store;
  beforeEach(() => {
    props = {
      name: 'Test-experimentName',
      children: [
        <Variation name="Original">Test Original</Variation>,
        <Variation name="Variation B">Test Variation B</Variation>,
      ]
    };
    store = {
      reduxAbTest: initialState.set('experiments', Immutable.fromJS([{
        name: 'Test-experimentName',
        variations: [
          { name: 'Original', weight: 10000 },
          { name: 'Variation B', weight: 0 },
        ]
      }])).set('active', Immutable.fromJS({ 'Test-experimentName': 'Variation B' }))
    };
    component = renderContainer(Experiment, props, store);
  });

  it('exists', () => {
    expect(component).to.exist;
    expect(component.html()).to.be.present;
  });

  it('is the Variation\'s contents', () => {
    expect(component).to.not.have.prop('name', 'Variation B');
    expect(component).to.have.tagName('span');
    expect(component).to.have.text('Test Variation B');
  });

});



describe.skip("Experiment", () => {
  let component;


  it("should choose the same Variation when a user identifier is defined.", co.wrap(function *(){
    let userIdentifier = UUID.v4();
    let experimentName = UUID.v4();
    let variationNames = [];
    for(let i = 0; i < 100; i++) {
      variationNames.push(UUID.v4());
    }
    let App = React.createClass({
      render: () =>{
        return <Experiment name={experimentName} userIdentifier={userIdentifier}>
          {variationNames.map(name => {
            return <Variation key={name} name={name}><div id={'variation-' + name}></div></Variation>
          })}
        </Experiment>;
      }
    });
    let chosenVariation;
    emitter.once("play", function(experimentName, variationName){
      chosenVariation = variationName;
    });
    let result = ReactDOMServer.renderToString(<App />);
    assert(chosenVariation);
    assert.notEqual(result.indexOf(chosenVariation), -1);
    for(let i = 0; i < 100; i++) {
      emitter._reset();
      result = ReactDOMServer.renderToString(<App />);
      assert.notEqual(result.indexOf(chosenVariation), -1);
    }
  }));
});
