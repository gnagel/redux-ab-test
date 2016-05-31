/** @flow */
import React     from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';

// Helper to convert variation => weight:number
export const toWeight = (variation) => { return variation.get('weight') || 0; };

// Calculate the total weight
export const toTotal = (variations) => variations.reduce( (total, variation) => { return total + toWeight(variation); }, 0);

// Generate the next range in the series
export const toRange = (list, counter) => {
  const startAt = list.count() <= 0 ? 0 : (list.last().last() + 1);
  const range = Immutable.Range(startAt, startAt + counter);
  return list.push(range);
};

// Geneate a contigious range of scores
export const toRanges = (variations) => variations.map(toWeight).reduce(toRange, Immutable.List([]));

export default function randomVariation(experiment, random = Math.random) {
  const variations = experiment.get('variations').sortBy(toWeight).reverse();
  const weightTotal = toTotal(variations);
  const weightRanges = toRanges(variations);
  const weightRandom = Math.round(weightTotal * random());

  // Find the range that contains our score
  const index = weightRanges.findIndex(range => range.includes(weightRandom));

  // Return the matching variation.  Returns variations.last() if random() was out of range [0, 1)
  const variation = variations.get(index, variations.last());
  return variation;
}
