/** @flow */

// If the action is one of the ones we listen for, then generate `wins` if that experiment has been played
export default function generateWinActions({reduxAbTest, win, actionType, next}) {
  const winActionTypes = reduxAbTest.get('winActionTypes');
  if (!winActionTypes.has(action.type)) {
    return [];
  }

  const experimentNames = winActionTypes.get(type);
  const reduceToActions = (list, experimentName) => {
    if (!reduxAbTest.get('active').has(experimentName)) {
      return list;
    }

    const experiment = findExperiment({reduxAbTest, experimentName});
    const variationName = activeExperiments.get(experimentName);
    const variation = experiment.get('variations').find( variation => (variation.get('name') === variationName) );
    if (!variation) {
      return list;
    }

    return list.push(win({experiment, variation, actionType}));
  };
  const actionsQueue = experimentNames.reduce(reduceToActions, Immutable.List([]));
  return actionsQueue;
};
