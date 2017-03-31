import React      from 'react';
import Immutable  from 'immutable';
import Variation  from './variation';
import { logger } from './logger';


export const groupChildrenByName = (children) => {
  const childrenByName = {};
  const count = React.Children.count(children);
  logger(`${__filename} groupChildrenByName: count=${count}`);
  if (count === 1) {
    if (!children.props.name) {
      throw new Error(`No name prop found on child=${JSON.stringify(children.props)}`);
    }
    childrenByName[ children.props.name ] = children;
  } else {
    React.Children.forEach(children, (child) => {
      if (!child.props.name) {
        throw new Error(`No name prop found on child=${JSON.stringify(child.props.name)}`);
      }
      childrenByName[child.props.name] = child;
    });
  }
  logger(`${__filename} groupChildrenByName: count=${count} childrenByName='${Object.keys(childrenByName).join('|')}'`);
  return childrenByName;
};


export const groupExperimentsByName = (state) => {
  const { reduxAbTest } = state;
  const experiments = reduxAbTest.getIn(['experiments'], Immutable.List());
  const experimentsByName = {};
  experiments.forEach(e => {
    experimentsByName[e.get('name', '').toLowerCase()] = e;
  });
  return experimentsByName;
};


export const getVariationsByName = (experiment) => {
  if (!experiment) {
    return {};
  }
  const variations = {};
  experiment.get('variations', Immutable.List()).forEach(variation => {
    variations[variation.get('name', '')] = variation;
  });
  return variations;
};


export const requireChildIsVariation = (componentName, index, child) => {
  if (child.type === Variation) {
    return undefined;
  }
  return new Error(`'${componentName}' should have a children of the type: 'Variation': child.index='${index}', child.type='${child.type}'`);
};


export const requireChildrenAreVariations = (props, propName, componentName) => {
  const children = props[propName];
  // Only accept children of the appropriate type
  const childrenCount = React.Children.count(children);
  switch(childrenCount) {
  case 0:
    return new Error(`'${componentName}' should have at least one child of the type: 'Variation': children.count='${childrenCount}'`);
  case 1:
    return requireChildIsVariation(componentName, 0, children);
  default: {
    const errors = React.Children.map( (index, child) => requireChildIsVariation(componentName, index, child) ).filter( err => err );
    if (errors.length !== 0) {
      return errors[0];
    }
    return undefined;
  }
  }
};
