/** @flow */
import Immutable from 'immutable';

export type VariationType = {
  id: ?string,
  name: string,
  weight: number,
};

export type ExperimentType = {
  id: ?string,
  name: string,
  variations: Array<VariationType>,
  winActionTypes: ?Array<string>,
};

export type WrapsExperimentType = {
  experiment: Immutable.Map
};

export type WrapsExperimentVariationType = {
  experiment: Immutable.Map,
  variation: Immutable.Map
};

export function recievesExperiment(opts:WrapsExperimentType) {}
export function recievesExperimentVariation(opts:WrapsExperimentVariationType) {}
