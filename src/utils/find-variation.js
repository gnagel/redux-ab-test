/** @flow */
import React from "react"; // eslint-disable-line no-unused-vars

/**
 * Find the experiment by name, raises an Error if not-found
 */
export default function findVariation(experiment:Immuable.Map, variationName:string):Immuable.Map {
  if (!experiment) {
    throw new Error(`The invalid experiment: '${experiment}'`);
  }

  const variation = experiment.get('variations').find( variation => variation.get('name') == variationName );
  if (!variation) {
    throw new Error(`The invalid variation: '${variationName}' was not found in experiment=${ experiment }`);
  }

  return variation;
}
