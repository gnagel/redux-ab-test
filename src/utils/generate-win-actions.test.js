import React from "react"; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect, spy } from 'test_helper';

import generateWinActions from './generate-win-actions';

describe('utils/generate-win-actions.js', () => {
  const initialState = Immutable.fromJS({
    experiments: [],
    plays: {},
    active: {},
    winners: {},
    winActionTypes: {}
  });

  const experiment:ExperimentType = {
    name: "Test-Name",
    variations: [
      { name: "Original", weight: 5000 },
      { name: "Variation #A", weight: 5000 },
      { name: "Variation #B", weight: 0 }
    ],
    winActionTypes: ['Test-action-1', 'Test-action-2'],
  };

  let next;
  let win;
  beforeEach(() => {
    next = spy();
    win = ({experiment, variation, actionType}) => Immutable.fromJS({experiment, variation, actionType});
  });

  it('exists', () => {
    expect(generateWinActions).to.exist;
    expect(generateWinActions).to.be.a('function');
  });

  it('has empty output', () => {
    const output = generateWinActions({
      reduxAbTest: initialState,
      win,
      actionType: null,
      next
    });
    expect(output).to.exist;
    expect(output).to.be.an.instanceof(Immutable.List);
    expect(output.toJS()).to.deep.equal([]);
  });

  it('has one action', () => {
    const output = generateWinActions({
      reduxAbTest: initialState.merge({
        experiments: [experiment],
        winActionTypes: {
          'Test-action-1': [experiment.name]
        },
        active: {
          'Test-Name': 'Original'
        }
      }),
      win,
      actionType: 'Test-action-1',
      next
    });
    expect(output).to.exist;
    expect(output).to.be.an.instanceof(Immutable.List);
    expect(output.toJS()).to.deep.equal([
      {
        experiment,
        variation: { name: "Original", weight: 5000 },
        actionType: 'Test-action-1'
      }
    ]);
  });

  it('has 1x actions, selects the active experiment', () => {
    const output = generateWinActions({
      reduxAbTest: initialState.merge({
        experiments: [experiment, {...experiment, name: 'Test-exeriment-2'}],
        winActionTypes: {
          'Test-action-1': [experiment.name]
        },
        active: {
          'Test-Name': 'Original'
        }
      }),
      win,
      actionType: 'Test-action-1',
      next
    });
    expect(output).to.exist;
    expect(output).to.be.an.instanceof(Immutable.List);
    expect(output.toJS()).to.deep.equal([
      {
        experiment,
        variation: { name: "Original", weight: 5000 },
        actionType: 'Test-action-1'
      }
    ]);
  });

  it('has two actions', () => {
    const output = generateWinActions({
      reduxAbTest: initialState.merge({
        experiments: [experiment, {...experiment, name: 'Test-exeriment-2'}],
        winActionTypes: {
          'Test-action-1': [experiment.name, 'Test-exeriment-2']
        },
        active: {
          'Test-Name': 'Original',
          'Test-exeriment-2': 'Variation #A',
        }
      }),
      win,
      actionType: 'Test-action-1',
      next
    });
    expect(output).to.exist;
    expect(output).to.be.an.instanceof(Immutable.List);
    expect(output.toJS()).to.deep.equal([
      {
        experiment,
        variation: { name: "Original", weight: 5000 },
        actionType: 'Test-action-1'
      },
      {
        experiment: {...experiment, name: 'Test-exeriment-2'},
        variation: { name: "Variation #A", weight: 5000 },
        actionType: 'Test-action-1'
      }
    ]);
  });

  it('throws an Error', () => {
    const output = () => {
      generateWinActions({
        reduxAbTest: initialState.merge({
          experiments: [],
          winActionTypes: {
            'Test-action-1': [experiment.name]
          },
          active: {
            'Test-Name': 'Original'
          }
        }),
        win,
        actionType: 'Test-action-1',
        next
      });
    };
    expect(output).to.throw(Error);
  });
});
