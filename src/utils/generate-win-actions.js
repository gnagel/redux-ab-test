/** @flow */
import Immutable from 'immutable';

type Props = {
  reduxAbTest:   Immutable.Map,
  win:           Function,
  actionType:    string,
  actionPayload: any,
};

// If the action is one of the ones we listen for, then generate `wins` if that experiment has been played
export default function generateWinActions(props:Props) {
  const { reduxAbTest, win, actionType, actionPayload } = props;

  // Experiment IDs that match the current action
  const experimentKeys = reduxAbTest.getIn(['win_action_types', actionType], null);
  if (!experimentKeys) {
    return Immutable.List([]);
  }

  const actions = experimentKeys.map(experimentKey => {
    const experiment = reduxAbTest.getIn(['allExperiments', experimentKey], null);
    if (!experiment) {
      return null;
    }

    const variationKey = reduxAbTest.getIn(['active', experimentKey]);
    const variation    = experiment.getIn(['variations', variationKey], null);
    if (!variation) {
      return null;
    }

    return win({experiment, variation, actionType, actionPayload});
  });
  return actions.filter( value => value );
}
