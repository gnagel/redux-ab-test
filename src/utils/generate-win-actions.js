/** @flow */
import Immutable from 'immutable';
import findExperiment from './find-experiment';


// If the action is one of the ones we listen for, then generate `wins` if that experiment has been played
export default function generateWinActions({reduxAbTest, win, actionType, actionPayload, next}) {
  const winActionTypes = reduxAbTest.get('winActionTypes');
  if (!winActionTypes.has(actionType)) {
    return Immutable.List([]);
  }

  const experimentNames = winActionTypes.get(actionType);
  const reduceToActions = (list, experimentName) => {
    if (!reduxAbTest.get('active').has(experimentName)) {
      return list;
    }

    const experiment = findExperiment({reduxAbTest, experimentName});
    const variationName = reduxAbTest.get('active').get(experimentName);
    const variation = experiment.get('variations').find( variation => (variation.get('name') === variationName) );
    if (!variation) {
      return list;
    }

    return list.push(win({experiment, variation, actionType, actionPayload}));
  };
  const actionsQueue = experimentNames.reduce(reduceToActions, Immutable.List([]));
  return actionsQueue;
};
