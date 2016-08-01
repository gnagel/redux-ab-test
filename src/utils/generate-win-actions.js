/** @flow */
import Immutable from 'immutable';
import getKey from './get-key';

type Props = {
  reduxAbTest:   Immutable.Map,
  win:           Function,
  actionType:    string,
  actionPayload: any,
};

// If the action is one of the ones we listen for, then generate `wins` if that experiment has been played
export default function generateWinActions(props:Props) {
  const { reduxAbTest, win, actionType, actionPayload } = props;
  const win_action_types = reduxAbTest.get('win_action_types');
  if (!win_action_types.has(actionType)) {
    return Immutable.List([]);
  }

  const experimentKeys = win_action_types.get(actionType);
  const reduceToActions = (list, experimentKey) => {
    if (!reduxAbTest.get('active').has(experimentKey)) {
      return list;
    }

    const experiment = reduxAbTest.get('experiments').find( experiment => (experimentKey === getKey(experiment)) );
    const variationKey = reduxAbTest.get('active').get(experimentKey);
    const variation = experiment.get('variations').find( variation => (variationKey === getKey(variation)) );
    if (!variation) {
      return list;
    }

    return list.push(win({experiment, variation, actionType, actionPayload}));
  };
  const actionsQueue = experimentKeys.reduce(reduceToActions, Immutable.List([]));
  return actionsQueue;
}
