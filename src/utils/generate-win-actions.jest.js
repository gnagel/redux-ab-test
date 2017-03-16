import Immutable from 'immutable';
import { spy } from 'sinon';

import generateWinActions from './generate-win-actions';

describe('utils/generate-win-actions.js', () => {
  const initialState = Immutable.fromJS({
    experiments:      [],
    plays:            {},
    active:           {},
    winners:          {},
    win_action_types: {},
  });

  const experiment = {
    name:       'Test-Name',
    variations: [
      { name: 'Original', weight: 5000 },
      { name: 'Variation #A', weight: 5000 },
      { name: 'Variation #B', weight: 0 },
    ],
    win_action_types: ['Test-action-1', 'Test-action-2'],
  };

  let next;
  let win;
  beforeEach(() => {
    next = spy();
    win = ({experiment, variation, actionType}) => Immutable.fromJS({experiment, variation, actionType});
  });

  it('exists', () => {
    expect(generateWinActions).not.toBeUndefined;
    expect(typeof generateWinActions).toEqual('function');
  });

  it('has empty output', () => {
    const output = generateWinActions({
      reduxAbTest: initialState,
      win,
      actionType:  null,
      next,
    });
    expect(output).not.toBeUndefined;
    expect(Immutable.List.isList(output)).toBeTruthy;
    expect(output.toJS()).toEqual([]);
  });

  it('has one action', () => {
    const output = generateWinActions({
      reduxAbTest: initialState.merge({
        experiments:      [experiment],
        win_action_types: {
          'Test-action-1': [experiment.name],
        },
        active: {
          'Test-Name': 'Original',
        },
      }),
      win,
      actionType: 'Test-action-1',
      next,
    });
    expect(output).not.toBeUndefined;
    expect(Immutable.List.isList(output)).toBeTruthy;
    expect(output.toJS()).toEqual([
      {
        experiment,
        variation:  { name: 'Original', weight: 5000 },
        actionType: 'Test-action-1',
      },
    ]);
  });

  it('has 1x actions, selects the active experiment', () => {
    const output = generateWinActions({
      reduxAbTest: initialState.merge({
        experiments:      [experiment, {...experiment, name: 'Test-experiment-2'}],
        win_action_types: {
          'Test-action-1': [experiment.name],
        },
        active: {
          'Test-Name': 'Original',
        },
      }),
      win,
      actionType: 'Test-action-1',
      next,
    });
    expect(output).not.toBeUndefined;
    expect(Immutable.List.isList(output)).toBeTruthy;
    expect(output.toJS()).toEqual([
      {
        experiment,
        variation:  { name: 'Original', weight: 5000 },
        actionType: 'Test-action-1',
      },
    ]);
  });

  it('has two actions', () => {
    const output = generateWinActions({
      reduxAbTest: initialState.merge({
        experiments:      [experiment, {...experiment, name: 'Test-experiment-2'}],
        win_action_types: {
          'Test-action-1': [experiment.name, 'Test-experiment-2'],
        },
        active: {
          'Test-Name':        'Original',
          'Test-experiment-2': 'Variation #A',
        },
      }),
      win,
      actionType: 'Test-action-1',
      next,
    });
    expect(output).not.toBeUndefined;
    expect(Immutable.List.isList(output)).toBeTruthy;
    expect(output.toJS()).toEqual([
      {
        experiment,
        variation:  { name: 'Original', weight: 5000 },
        actionType: 'Test-action-1',
      },
      {
        experiment: {...experiment, name: 'Test-experiment-2'},
        variation:  { name: 'Variation #A', weight: 5000 },
        actionType: 'Test-action-1',
      },
    ]);
  });

  it('throws an Error', () => {
    const output = () => {
      generateWinActions({
        reduxAbTest: initialState.merge({
          experiments:      [],
          win_action_types: {
            'Test-action-1': [experiment.name],
          },
          active: {
            'Test-Name': 'Original',
          },
        }),
        win,
        actionType: 'Test-action-1',
        next,
      });
    };
    expect(output).toThrow(Error);
  });
});
