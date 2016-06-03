// Immutable Helpers
import Immutable from 'immutable';

export const immutableExperiment = ({experiment}) => Immutable.fromJS({experiment});
export const immutableExperimentVariation = ({experiment, variation}) => Immutable.fromJS({experiment, variation});
