import React from 'react'; //eslint-disable-line
import { storiesOf } from '@kadira/storybook';
import { decorateStore } from '../../../.storybook/store';
import Experiment from './experiment'; //eslint-disable-line
import Variation from '../variation'; //eslint-disable-line
import Debugger from '../debugger'; //eslint-disable-line

const __state__ = {
  experiments: [
    {
      id:         'Test-experimentId',
      name:       'Test-experimentName',
      variations: [
        { name: 'Original', weight: 10000 },
        { name: 'Variation B', weight: 0 }
      ],
    },
  ],
};


storiesOf('Experiment', module)
  .addDecorator(decorateStore(__state__))

  .add('Original variation in an experiment', () => (
    <div>
      <Experiment
        name='Test-experimentName'
        experimentName='Test-experimentName'
        >
        <Variation name='Original'>Original content</Variation>
        <Variation name='Variation B'>Variation B's content</Variation>
      </Experiment>
      <Debugger />
    </div>
  ))
  ;
