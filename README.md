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

<h1>Table of Contents</h1>

- [Installation](#installation)
- [Alternative Libraries](#alternative-libraries)
- [Resources for A/B Testing with React](#resources-for-ab-testing-with-react)
- [API Reference](#api-reference)
  - [`<Experiment />`](#experiment-)
  - [`<Variant />`](#variant-)
- [Tests](#tests)
  - [Running Tests](#running-tests)

## Installation

`redux-ab-test` is compatible with React 0.15.x.

```bash
npm install redux-ab-test
```

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
