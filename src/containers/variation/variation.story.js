import React from 'react'; //eslint-disable-line
import { storiesOf } from '@kadira/storybook';
import { decorateStore } from '../../../.storybook/store';
import Variation from './variation'; //eslint-disable-line

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


storiesOf('Account: Banner', module)
  .addDecorator(decorateStore(__state__))

  .add('Without props', () => (
    <Variation
      name='Variation B'
      experimentName='Test-experimentName'
      />
  ))
  ;
