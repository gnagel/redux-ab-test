import React     from 'react';
import Immutable from 'immutable';


export const groupChildrenByName = (children) => {
  const childrenByName = {};
  if (React.Children.count(children) === 0) {
    childrenByName[ children.props.name ] = children;
  } else {
    React.Children.map(child => {
      child[child.props.name] = child;
    });
  }
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
