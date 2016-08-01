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

  // Get only the experients that match this actionType and are currently active
  const experimentKeys = reduxAbTest.getIn( ['win_action_types', actionType], Immutable.List([]) ).filter( experimentKey => reduxAbTest.hasIn(['active', experimentKey]) );

  // Map the experiments to variations and to redux `win` actions
  const output = [];
  experimentKeys.forEach(experimentKey => {
    const variationKey = reduxAbTest.getIn(['active', experimentKey]);
    const experiment   = reduxAbTest.get('experiments').find(experiment => (getKey(experiment) === experimentKey), null);
    if (!experiment) {
      return;
    }
    const variation = experiment.get('variations').find(variation => (getKey(variation) === variationKey), null);
    if (!variation) {
      return;
    }
    output.push( win({experiment, variation, actionType, actionPayload}) );
  });

  // Return the collection of `win` actions that match the experiments
  return output;
}
