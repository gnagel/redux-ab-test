# [Redux AB Test: UI optimization that works](https://www.npmjs.com/package/redux-ab-test)

[![npm version](https://badge.fury.io/js/redux-ab-test.svg)](https://www.npmjs.com/package/redux-ab-test)
[![Build Status](https://travis-ci.org/gnagel/redux-ab-test.svg)](https://travis-ci.org/gnagel/redux-ab-test)
[![Dependency Status](https://david-dm.org/gnagel/redux-ab-test.svg)](https://david-dm.org/gnagel/redux-ab-test)
[![npm downloads](https://img.shields.io/npm/dm/redux-ab-test.svg?style=flat)](https://www.npmjs.com/package/redux-ab-test)

Support for testing multiple versions of your components with React and Redux.
- Works great with [React](https://facebook.github.io/react/)
- Integrated with [Redux](http://redux.js.org)
- Supports multiple experiments and variations with a simple DSL
- Respects precedence order when specifying audience and react-router criteria
- Can be used for server rendering
- Few dependencies, small (20k, 6k gzipped)


# Installation

Redux AB Test is distributed via [npm](https://www.npmjs.com/):

```
npm install --save redux-ab-test
```

# API

```js
import React, { Component } from 'react';

class App extends Component {
  render() {
    return (
      <Provider store={...}>
        <div>
          <h1> Welcome to my app! </h1>
          <h2> Checkout my amazing homepage! </h2>

          { /** Try out new versions of your homepage!  */ }
          <Experiment name="Cover Art Test">

            { /** Default homepage experience */ }
            <Variant name="Control" weight={50}>
              <RegularHomepage />
            </Variant>

            { /** Guided Onboarding Wizard */ }
            <Variant name="Guided Flow" weight={25}>
              <OnboarindHomepage />
            </Variant>

            { /** Modals for all of the things! */ }
            <Variant name="Modals Everywhere" weight={25}>
              <HomePageWithModals />
            </Variant>

          </Experiment>
        </div>
      </Provider>
    );
  }
}
```

## Server-side rendering
redux-ab-test supports server-side rendering by default.  

## React-Redux
Experiments are stored in the redux store, which you can use to push **play** & **win** events to your analytics provider.  Here's an example of a simle middleware that listens for those events and dispatches to `window.trackEvent(<event name>, { <event data })`;

```js
import { createStore, applyMiddleware, compose } from 'redux';
import { reactAbTest, reactAbTestInitialState, reduxAbTestMiddleware } from 'redux-ab-test';
import { createAction, handleActions } from 'redux-actions';
import { PLAY, WIN } = 'redux-ab-test';

// Create a middleware that listens for plays & wins
const pushToAnalytics = store => next => action => {
  const output = next(action);
  switch(action.type) {
    case PLAY: {
      const experiment = action.payload.get('experiment');
      const variation  = action.payload.get('variation');
      window.trackEvent('Experiment Played', { ... })
      break;
    }
    case WIN: {
      const experiment    = action.payload.get('experiment');
      const variation     = action.payload.get('variation');
      const actionType    = action.payload.get('actionType');
      const actionPayload = action.payload.get('actionPayload');
      window.trackEvent('Experiment Won', { ... })
      break;
    }
  }
  return output;
};

const middlewares = [ reduxAbTestMiddleware, pushToAnalytics /*, thunk, promise, ...*/ ];
const finalCreateStore = compose(applyMiddleware.apply(this, middleware))(createStore);
const reducers = { reactAbTest };
export default finalCreateStore(reducers, {});

```

Please [★ on GitHub](https://github.com/gnagel/redux-ab-test)!

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<h1>Table of Contents</h1>

- [Installation](#installation)
- [Usage](#usage)
  - [Standalone Component](#standalone-component)
  - [Coordinate Multiple Components](#coordinate-multiple-components)
  - [Weighting Variants](#weighting-variants)
  - [Debugging](#debugging)
  - [Server Rendering](#server-rendering)
    - [Example](#example)
  - [With Babel](#with-babel)
- [Alternative Libraries](#alternative-libraries)
- [Resources for A/B Testing with React](#resources-for-ab-testing-with-react)
- [API Reference](#api-reference)
  - [`<Experiment />`](#experiment-)
  - [`<Variant />`](#variant-)
- [Tests](#tests)
  - [Running Tests](#running-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

`redux-ab-test` is compatible with React 0.15.x.

```bash
npm install redux-ab-test
```

## Usage

### Standalone Component

Try it [on JSFiddle](https://jsfiddle.net/pushtell/m14qvy7r/)

```js

var Experiment = require("redux-ab-test/src/experiment");
var Variant = require("redux-ab-test/src/variation");
var emitter = require("redux-ab-test/src/emitter");

var App = React.createClass({
  onButtonClick: function(e){
    this.refs.experiment.win();
  },
  render: function(){
    return <div>
      <Experiment ref="experiment" name="My Example">
        <Variant name="A">
          <div>Section A</div>
        </Variant>
        <Variant name="B">
          <div>Section B</div>
        </Variant>
      </Experiment>
      <button onClick={this.onButtonClick}>Emit a win</button>
    </div>;
  }
});

// Called when the experiment is displayed to the user.
emitter.addPlayListener(function(experimentName, variantName){
  console.log("Displaying experiment ‘" + experimentName + "’ variant ‘" + variantName + "’");
});

// Called when a 'win' is emitted, in this case by this.refs.experiment.win()
emitter.addWinListener(function(experimentName, variantName){
  console.log("Variant ‘" + variantName + "’ of experiment ‘" + experimentName + "’  was clicked");
});

```

### Coordinate Multiple Components

Try it [on JSFiddle](http://jsfiddle.net/pushtell/pcutps9q/)

```js

var Experiment = require("redux-ab-test/src/Experiment");
var Variant = require("redux-ab-test/src/Variant");
var emitter = require("redux-ab-test/src/emitter");

// Define variants in advance.
emitter.defineVariants("My Example", ["A", "B", "C"]);

var Component1 = React.createClass({
  render: function(){
    return <Experiment name="My Example">
      <Variant name="A">
        <div>Section A</div>
      </Variant>
      <Variant name="B">
        <div>Section B</div>
      </Variant>
    </Experiment>;
  }
});

var Component2 = React.createClass({
  render: function(){
    return <Experiment name="My Example">
      <Variant name="A">
        <div>Subsection A</div>
      </Variant>
      <Variant name="B">
        <div>Subsection B</div>
      </Variant>
      <Variant name="C">
        <div>Subsection C</div>
      </Variant>
    </Experiment>;
  }
});

var Component3 = React.createClass({
  onButtonClick: function(e){
    emitter.emitWin("My Example");
  },
  render: function(){
    return <button onClick={this.onButtonClick}>Emit a win</button>;
  }
});

var App = React.createClass({
  render: function(){
    return <div>
      <Component1 />
      <Component2 />
      <Component3 />
    </div>;
  }
});

// Called when the experiment is displayed to the user.
emitter.addPlayListener(function(experimentName, variantName){
  console.log("Displaying experiment ‘" + experimentName + "’ variant ‘" + variantName + "’");
});

// Called when a 'win' is emitted, in this case by emitter.emitWin()
emitter.addWinListener(function(experimentName, variantName){
  console.log("Variant ‘" + variantName + "’ of experiment ‘" + experimentName + "’ was clicked");
});

```

### Weighting Variants

Try it [on JSFiddle](http://jsfiddle.net/pushtell/e2q7xe4f/)

Use [emitter.defineVariants()](#emitterdefinevariantsexperimentname-variantnames--variantweights) to optionally define the ratios by which variants are chosen.

```js

var Experiment = require("redux-ab-test/src/Experiment");
var Variant = require("redux-ab-test/src/Variant");
var emitter = require("redux-ab-test/src/emitter");

// Define variants and weights in advance.
emitter.defineVariants("My Example", ["A", "B", "C"], [10, 40, 40]);

var App = React.createClass({
  render: function(){
    return <div>
      <Experiment ref="experiment" name="My Example">
        <Variant name="A">
          <div>Section A</div>
        </Variant>
        <Variant name="B">
          <div>Section B</div>
        </Variant>
        <Variant name="C">
          <div>Section C</div>
        </Variant>
      </Experiment>
    </div>;
  }
});

```

### Debugging

The [debugger](#experimentdebugger) attaches a fixed-position panel to the bottom of the `<body>` element that displays mounted experiments and enables the user to change active variants in real-time.

The debugger is wrapped in a conditional `if(process.env.NODE_ENV === "production") {...}` and will not display on production builds using [envify](https://github.com/hughsk/envify).

<img src="https://cdn.rawgit.com/gnagel/redux-ab-test/master/documentation-images/debugger-animated-2.gif" width="325" height="325" />

Try it [on JSFiddle](http://jsfiddle.net/pushtell/vs9kkxLd/)

```js

var Experiment = require("redux-ab-test/src/Experiment");
var Variant = require("redux-ab-test/src/Variant");
var experimentDebugger = require("redux-ab-test/src/debugger");

experimentDebugger.enable();

var App = React.createClass({
  render: function(){
    return <div>
      <Experiment ref="experiment" name="My Example">
        <Variant name="A">
          <div>Section A</div>
        </Variant>
        <Variant name="B">
          <div>Section B</div>
        </Variant>
      </Experiment>
    </div>;
  }
});

```
### Server Rendering

A [`<Experiment />`](#experiment-) with a `userIdentifier` property will choose a consistent [`<Variant />`](#variant-) suitable for server side rendering.

See [`./examples/isomorphic`](https://github.com/gnagel/redux-ab-test/tree/develop/examples/isomorphic) for a working example.

#### Example

The component in [`Component.jsx`](https://github.com/gnagel/redux-ab-test/blob/master/examples/isomorphic/Component.jsx):

```js

var React = require("react");
var Experiment = require("redux-ab-test/src/Experiment");
var Variant = require("redux-ab-test/src/Variant");

module.exports = React.createClass({
  propTypes: {
    userIdentifier: React.PropTypes.string.isRequired
  },
  render: function(){
    return <div>
      <Experiment ref="experiment" name="My Example" userIdentifier={this.props.userIdentifier}>
        <Variant name="A">
          <div>Section A</div>
        </Variant>
        <Variant name="B">
          <div>Section B</div>
        </Variant>
      </Experiment>
    </div>;
  }
});

```

We use a session ID for the `userIdentifier` property in this example, although a long-lived user ID would be preferable. See [`server.js`](https://github.com/gnagel/redux-ab-test/blob/master/examples/isomorphic/server.js):

```js
require("babel/register")({only: /jsx/});

var express = require('express');
var session = require('express-session');
var React = require("react");
var ReactDOMServer = require("react-dom/server");
var Component = require("./Component.jsx");

var app = express();

app.set('view engine', 'ejs');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.get('/', function (req, res) {
  var reactElement = React.createElement(Component, {userIdentifier: req.sessionID});
  var reactString = ReactDOMServer.renderToString(reactElement);
  res.render('template', {
    sessionID: req.sessionID,
    reactOutput: reactString
  });
});

app.use(express.static('www'));

app.listen(8080);
```

An [EJS](https://github.com/mde/ejs) template in [`template.ejs`](https://github.com/gnagel/redux-ab-test/blob/master/examples/isomorphic/views/template.ejs):

```html
<!doctype html>
<html>
  <head>
    <title>Isomorphic Rendering Example</title>
  </head>
  <script type="text/javascript">
    var SESSION_ID = <%- JSON.stringify(sessionID) %>;
  </script>
  <body>
    <div id="react-mount"><%- reactOutput %></div>
    <script type="text/javascript" src="bundle.js"></script>
  </body>
</html>
```

On the client in [`app.jsx`](https://github.com/gnagel/redux-ab-test/blob/master/examples/isomorphic/www/app.jsx):

```js
var React = require('react');
var ReactDOM = require('react-dom');
var Component = require("../Component.jsx");

var container = document.getElementById("react-mount");

ReactDOM.render(<Component userIdentifier={SESSION_ID} />, container);
```

### With Babel

Code from [`./src`](https://github.com/gnagel/redux-ab-test/tree/master/src) is written in [JSX](https://facebook.github.io/jsx/) and transpiled into [`./lib`](https://github.com/gnagel/redux-ab-test/tree/master/lib) using [Babel](https://babeljs.io/). If your project uses Babel you may want to include files from [`./src`](https://github.com/gnagel/redux-ab-test/tree/master/src) directly.

## Alternative Libraries
* [**react-experiments**](https://github.com/HubSpot/react-experiments) - “A JavaScript library that assists in defining and managing UI experiments in React” by [Hubspot](https://github.com/HubSpot). Uses Facebook's [PlanOut framework](http://facebook.github.io/planout/) via [Hubspot's javascript port](https://github.com/HubSpot/PlanOut.js).
* [**react-ab**](https://github.com/olahol/react-ab) - “Simple declarative and universal A/B testing component for React” by [Ola Holmström](https://github.com/olahol)
* [**react-native-ab**](https://github.com/lwansbrough/react-native-ab/) - “A component for rendering A/B tests in React Native” by [Loch Wansbrough](https://github.com/lwansbrough)

Please [let us know](https://github.com/gnagel/redux-ab-test/issues/new) about alternate libraries not included here.

## Resources for A/B Testing with React

* [Product Experimentation with React and PlanOut](http://product.hubspot.com/blog/product-experimentation-with-planout-and-react.js) on the [HubSpot Product Blog](http://product.hubspot.com/)
* [Roll Your Own A/B Tests With Optimizely and React](http://engineering.tilt.com/roll-your-own-ab-tests-with-optimizely-and-react/) on the [Tilt Engineering Blog](http://engineering.tilt.com/)
* [Simple Sequential A/B Testing](http://www.evanmiller.org/sequential-ab-testing.html)
* [A/B Testing Rigorously (without losing your job)](http://elem.com/~btilly/ab-testing-multiple-looks/part1-rigorous.html)

Please [let us know](https://github.com/gnagel/redux-ab-test/issues/new) about React A/B testing resources not included here.

## API Reference

### `<Experiment />`

Experiment container component. Children must be of type [`Variant`](#variant-).

* **Properties:**
  * `name` - Name of the experiment.
    * **Required**
    * **Type:** `string`
    * **Example:** `"My Example"`
  * `userIdentifier` - Distinct user identifier. When defined, this value is hashed to choose a variant if `defaultVariantName` or a stored value is not present. Useful for [server side rendering](#server-rendering).
    * **Optional**
    * **Type:** `string`
    * **Example:** `"7cf61a4521f24507936a8977e1eee2d4"`
  * `defaultVariantName` - Name of the default variant. When defined, this value is used to choose a variant if a stored value is not present. This property may be useful for [server side rendering](#server-rendering) but is otherwise not recommended.
    * **Optional**
    * **Type:** `string`
    * **Example:** `"A"`

### `<Variant />`

Variant container component.

* **Properties:**
  * `name` - Name of the variant.
    * **Required**
    * **Type:** `string`
    * **Example:** `"A"`

### `emitter`

Event emitter responsible for coordinating and reporting usage. Extended from [facebook/emitter](https://github.com/facebook/emitter).

#### `emitter.emitWin(experimentName)`

Emit a win event.

* **Return Type:** No return value
* **Parameters:**
  * `experimentName` - Name of an experiment.
    * **Required**
    * **Type:** `string`
    * **Example:** `"My Example"`

#### `emitter.addActiveVariantListener([experimentName, ] callback)`

Listen for the active variant specified by an experiment.

* **Return Type:** [`Subscription`](#subscription)
* **Parameters:**
  * `experimentName` - Name of an experiment. If provided, the callback will only be called for the specified experiment.
    * **Optional**
    * **Type:** `string`
    * **Example:** `"My Example"`
  * `callback` - Function to be called when a variant is chosen.
    * **Required**
    * **Type:** `function`
    * **Callback Arguments:**
      * `experimentName` - Name of the experiment.
        * **Type:** `string`
      * `variantName` - Name of the variant.
        * **Type:** `string`

#### `emitter.addPlayListener([experimentName, ] callback)`

Listen for an experiment being displayed to the user. Trigged by the [React componentWillMount lifecycle method](https://facebook.github.io/react/docs/component-specs.html#mounting-componentwillmount).

* **Return Type:** [`Subscription`](#subscription)
* **Parameters:**
  * `experimentName` - Name of an experiment. If provided, the callback will only be called for the specified experiment.
    * **Optional**
    * **Type:** `string`
    * **Example:** `"My Example"`
  * `callback` - Function to be called when an experiment is displayed to the user.
    * **Required**
    * **Type:** `function`
    * **Callback Arguments:**
      * `experimentName` - Name of the experiment.
        * **Type:** `string`
      * `variantName` - Name of the variant.
        * **Type:** `string`

#### `emitter.addWinListener([experimentName, ] callback)`

Listen for a successful outcome from the experiment. Trigged by the [emitter.emitWin(experimentName)](#emitteremitwinexperimentname) method.

* **Return Type:** [`Subscription`](#subscription)
* **Parameters:**
  * `experimentName` - Name of an experiment. If provided, the callback will only be called for the specified experiment.
    * **Optional**
    * **Type:** `string`
    * **Example:** `"My Example"`
  * `callback` - Function to be called when a win is emitted.
    * **Required**
    * **Type:** `function`
    * **Callback Arguments:**
      * `experimentName` - Name of the experiment.
        * **Type:** `string`
      * `variantName` - Name of the variant.
        * **Type:** `string`

#### `emitter.defineVariants(experimentName, variantNames [, variantWeights])`

Define experiment variant names and weighting. Required when an experiment [spans multiple components](#coordinate-multiple-components) containing different sets of variants.

If `variantWeights` are not specified variants will be chosen at equal rates.

The variants will be chosen according to the ratio of the numbers, for example variants `["A", "B", "C"]` with weights `[20, 40, 40]` will be chosen 20%, 40%, and 40% of the time, respectively.

* **Return Type:** No return value
* **Parameters:**
  * `experimentName` - Name of the experiment.
    * **Required**
    * **Type:** `string`
    * **Example:** `"My Example"`
  * `variantNames` - Array of variant names.
    * **Required**
    * **Type:** `Array.<string>`
    * **Example:** `["A", "B", "C"]`
  * `variantWeights` - Array of variant weights.
    * **Optional**
    * **Type:** `Array.<number>`
    * **Example:** `[20, 40, 40]`

#### `emitter.setActiveVariant(experimentName, variantName)`

Set the active variant of an experiment.

* **Return Type:** No return value
* **Parameters:**
  * `experimentName` - Name of the experiment.
    * **Required**
    * **Type:** `string`
    * **Example:** `"My Example"`
  * `variantName` - Name of the variant.
    * **Required**
    * **Type:** `string`
    * **Example:** `"A"`

#### `emitter.getActiveVariant(experimentName)`

Returns the variant name currently displayed by the experiment.

* **Return Type:** `string`
* **Parameters:**
  * `experimentName` - Name of the experiment.
    * **Required**
    * **Type:** `string`
    * **Example:** `"My Example"`

#### `emitter.getSortedVariants(experimentName)`

Returns a sorted array of variant names associated with the experiment.

* **Return Type:** `Array.<string>`
* **Parameters:**
  * `experimentName` - Name of the experiment.
    * **Required**
    * **Type:** `string`
    * **Example:** `"My Example"`

### `Subscription`

Returned by the emitter's add listener methods. More information available in the [facebook/emitter documentation.](https://github.com/facebook/emitter#api-concepts)

## Resources for A/B Testing with React

* [Product Experimentation with React and PlanOut](http://product.hubspot.com/blog/product-experimentation-with-planout-and-react.js) on the [HubSpot Product Blog](http://product.hubspot.com/)
* [Roll Your Own A/B Tests With Optimizely and React](http://engineering.tilt.com/roll-your-own-ab-tests-with-optimizely-and-react/) on the [Tilt Engineering Blog](http://engineering.tilt.com/)
* [Simple Sequential A/B Testing](http://www.evanmiller.org/sequential-ab-testing.html)
* [A/B Testing Rigorously (without losing your job)](http://elem.com/~btilly/ab-testing-multiple-looks/part1-rigorous.html)

Please [let us know](https://github.com/gnagel/redux-ab-test/issues/new) about React A/B testing resources not included here.


## Tests

[Mocha](https://mochajs.org/) tests are performed on the latest version of [Node](https://nodejs.org/en/).

Please let me know if a different configuration should be included here.

### Running Tests

Locally:

```bash
npm install
npm test
```
