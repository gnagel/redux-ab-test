import React from 'react'; // eslint-disable-line no-unused-vars
import Immutable from 'immutable';
import { expect } from 'test_helper';
import { initialState } from '../module';
import availableExperiments, { matchesField, matchesAudience, matchesRoute } from './available-experiments';


describe('utils/available-experiments.js', () => {
  describe('matchesField', () => {
    it('exists', () => {
      expect(matchesField).to.exist;
      expect(matchesField).to.be.a('function');
    });

    it('has the correct output for ===', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '===', 10)).to.be.true;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '===', 0)).to.be.false;
    });

    it('has the correct output for >=', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '>=', 10)).to.be.true;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '>=', 11  )).to.be.false;
    });

    it('has the correct output for >', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '>', 9)).to.be.true;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '>', 10)).to.be.false;
    });

    it('has the correct output for <=', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '<=', 10)).to.be.true;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '<=', 9)).to.be.false;
    });

    it('has the correct output for <', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '<', 11)).to.be.true;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '<', 10)).to.be.false;
    });

    it('has the correct output for in', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', 'in', [9, 10, 11])).to.be.true;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', 'in', [0])).to.be.false;
    });

    it('has the correct output for not in', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', 'not in', [1])).to.be.true;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', 'not in', [10])).to.be.false;
    });
  });


  describe('matchesRoute', () => {
    const blankRoute    = initialState.get('route');
    const homepageRoute = initialState.get('route').merge({ pathName: '/', path: '/' });
    const dynamicRoute  = initialState.get('route').merge({ pathName: '/posts/2', path: '/posts:id', params: { 'id': '2' } });
    const utmsRoute     = initialState.get('route').merge({ pathName: '/magic', query: { 'utm_campaign': 'test-campaignName', 'utm_source': 'harry-potter' } });

    it('exists', () => {
      expect(matchesRoute).to.exist;
      expect(matchesRoute).to.be.a('function');
    });

    it('undefined matches any route', () => {
      expect(matchesRoute( blankRoute, undefined )).to.be.true;
    });

    it('null matches any route', () => {
      expect(matchesRoute( blankRoute, null )).to.be.true;
    });

    it('empty hash matches any route', () => {
      expect(matchesRoute( homepageRoute, Immutable.fromJS({}) )).to.be.true;
    });

    it('exactly matches pathName', () => {
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName:              '/'                }  ) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/']               } }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/', '/magic']     } }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/', '/404']       } }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'not in': ['/404', '/magic']  } }) )).to.be.true; // eslint-disable-line
    });

    it('doesnt match pathName', () => {
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName:              '/404'              }  ) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/404']             } }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/404', '/magic']   } }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/404', '/404']     } }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'not in': ['/', '/help']       } }) )).to.be.false; // eslint-disable-line
    });

    it('exactly matches path', () => {
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path:              '/posts:id'              }  ) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/posts:id']             } }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/posts:id', '/magic']   } }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/posts:id', '/404']     } }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'not in': ['/404', '/help']         } }) )).to.be.true; // eslint-disable-line
    });

    it('doesnt match path', () => {
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path:              '/404'                 }  ) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/404']                } }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/404', '/magic']      } }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/404', '/help']       } }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'not in': ['/posts:id', '/help']  } }) )).to.be.false; // eslint-disable-line
    });

    it('exactly matches path with params', () => {
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id':              '2'              }}  ) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['2']             }} }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['2', 'slug']     }} }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['2', '3']        }} }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'not in': ['404']           }} }) )).to.be.true; // eslint-disable-line
    });

    it('doesnt match path with missing params', () => {
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'invalid-param': 'n/a'              } }) )).to.be.false; // eslint-disable-line
    });

    it('doesnt match path with params', () => {
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id':              '3'              }}  ) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['3']             }} }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['3', 'slug']     }} }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['3', '15']       }} }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'not in': ['2']             }} }) )).to.be.false; // eslint-disable-line
    });

    it('exactly matches pathName with query', () => {
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign':              'test-campaignName'              }}  ) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign': { 'in':     ['test-campaignName']             }} }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign': { 'in':     ['test-campaignName', 'slug']     }} }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign': { 'in':     ['test-campaignName', '3']        }} }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign': { 'not in': ['404']                           }} }) )).to.be.true; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'id':           { 'not in': ['2']                             }} }) )).to.be.true; // eslint-disable-line
    });

    it('doesnt match pathName with missing query', () => {
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'invalid-param': 'n/a'              } }) )).to.be.false; // eslint-disable-line
    });

    it('doesnt match pathName with query', () => {
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'id':                        '3'                  }}  ) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'id':           { 'in':     ['3']                 }} }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'id':           { 'in':     ['3', 'slug']         }} }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'id':           { 'in':     ['3', '15']           }} }) )).to.be.false; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign': { 'not in': ['test-campaignName'] }} }) )).to.be.false; // eslint-disable-line
    });
  });


  describe('matchesAudience', () => {
    const blankAudience   = Immutable.fromJS({});
    const vipAudience     = Immutable.fromJS({ type: 'vip' });
    const stateAudience   = Immutable.fromJS({ type: 'vip', state: 'NY' });
    const ordersAudience  = Immutable.fromJS({ type: 'vip', orders: 10  });
    const specialAudience = Immutable.fromJS({ type: 'vip', orders: 10, state: 'CA' });

    it('exists', () => {
      expect(matchesAudience).to.exist;
      expect(matchesAudience).to.be.a('function');
    });

    it('undefined matches any audience', () => {
      expect(matchesAudience( blankAudience, undefined )).to.be.true;
    });

    it('null matches any audience', () => {
      expect(matchesAudience( blankAudience, null )).to.be.true;
    });

    it('empty hash matches any audience', () => {
      expect(matchesAudience( vipAudience, Immutable.fromJS({}) )).to.be.true;
    });

    it('matches on state', () => {
      expect(matchesAudience(stateAudience,   Immutable.fromJS({ state:             'NY'           }  ) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(stateAudience,   Immutable.fromJS({ state: { 'in':     ['NY']         } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(stateAudience,   Immutable.fromJS({ state: { 'in':     ['NY', 'N/A']  } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(stateAudience,   Immutable.fromJS({ state: { 'in':     ['NY', 'DC']   } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(stateAudience,   Immutable.fromJS({ state: { 'not in': ['N/A']        } }) )).to.be.true; // eslint-disable-line
    });

    it('doesnt match on state', () => {
      expect(matchesAudience(blankAudience, Immutable.fromJS({ type:             'ny'           }  ) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(stateAudience, Immutable.fromJS({ type:             'ny'           }  ) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(stateAudience, Immutable.fromJS({ type: { 'in':     ['ny']         } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(stateAudience, Immutable.fromJS({ type: { 'in':     ['ny']         } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(stateAudience, Immutable.fromJS({ type: { 'in':     ['ny', 'ca']   } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(stateAudience, Immutable.fromJS({ type: { 'in':     ['ny', 'ca']   } }) )).to.be.false; // eslint-disable-line
      // expect(matchesAudience(stateAudience, Immutable.fromJS({ type: { 'not in': ['ny', 'NY']   } }) )).to.be.false; // eslint-disable-line TODO -> fixme?
    });

    it('matches on vip', () => {
      // Exactly matches on 'vip'
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type:             'vip'           }  ) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['vip']         } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['vip', '1pct'] } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['vip', '1pct'] } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'not in': ['loggedout']   } }) )).to.be.true; // eslint-disable-line
    });

    it('doesnt match on VIP', () => {
      // Is case sensitive: 'vip' !=== 'VIP'
      expect(matchesAudience(blankAudience, Immutable.fromJS({ type:             'VIP'           }  ) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type:             'VIP'           }  ) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['VIP']         } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['VIP']         } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['VIP', '1PCT'] } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['VIP', '1PCT'] } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'not in': ['vip']         } }) )).to.be.false; // eslint-disable-line
    });

    it('matches on orders', () => {
      // Exactly matches on 'orders'
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders:              10           }  ) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '===':     10           } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>=':      10           } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>=':       0           } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>':        0           } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<=':      10           } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<=':      11           } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { 'in':     [10, 11, 9]   } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { 'not in': [1, 2, 3]     } }) )).to.be.true; // eslint-disable-line
    });

    it('matches on a range of orders', () => {
      // Inside a range
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>=': 5,  '<=': 15 } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>':  9,  '<':  11 } }) )).to.be.true; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>':  9,  '<':  11 } }) )).to.be.true; // eslint-disable-line

      // Outside of a range
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<=': 5,  '>=': 15 } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<':  9,  '>':  11 } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<':  9,  '>':  11 } }) )).to.be.false; // eslint-disable-line
    });

    it('doesnt match on orders', () => {
      expect(matchesAudience(blankAudience,  Immutable.fromJS({ orders:               1           }  ) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '===':    -10           } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>=':      11           } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>':       11           } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<=':       9           } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<=':       0           } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<':        0           } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<':       10           } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { 'in':     [1, 2, 3]     } }) )).to.be.false; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { 'not in': [10, 11, 9]   } }) )).to.be.false; // eslint-disable-line
    });

    it('exactly matches vip, orders, and state', () => {
      expect(matchesAudience(specialAudience, Immutable.fromJS({}) )).to.be.true;
      expect(matchesAudience(specialAudience, Immutable.fromJS({ type: 'vip', orders: { '>=': 5, '<=': 15 }, state: { 'in': ['NY', 'CA', 'FL'] } }) )).to.be.true;
    });
  });


  describe('availableExperiments', () => {
    const experiment_0 = Immutable.fromJS({
      name:       'No Audience',
      variations: [
        { name: 'Original', weight: 5000 },
        { name: 'Variation #A', weight: 5000 },
        { name: 'Variation #B', weight: 0 }
      ],
    });

    const experiment_a = Immutable.fromJS({
      key:           'BlankAudienceComponent',
      name:          'Blank Audience 1',
      audienceProps: {},
      variations:    [
        { name: 'Original', weight: 5000 },
        { name: 'Variation #A', weight: 5000 },
        { name: 'Variation #B', weight: 0 }
      ],
    });

    const experiment_a2 = Immutable.fromJS({
      key:           'BlankAudienceComponent',
      name:          'Blank Audience 2',
      audienceProps: {},
      variations:    [
        { name: 'Original', weight: 5000 },
        { name: 'Variation #A', weight: 5000 },
        { name: 'Variation #B', weight: 0 }
      ],
    });

    const experiment_b = Immutable.fromJS({
      key:           'SimpleAudienceComponent',
      name:          'Simple Audience Type',
      audienceProps: {
        type: 'vip',
      },
      routeProps: {
        pathName: { in: ['/magic', '/'] }
      },
      variations: [
        { name: 'Original', weight: 5000 },
        { name: 'Variation #A', weight: 5000 },
        { name: 'Variation #B', weight: 0 }
      ],
    });

    const experiment_c = Immutable.fromJS({
      key:           'ComplexAudienceComponent',
      name:          'Complex Audience Type',
      audienceProps: {
        type:   'vip',
        orders: { '>=': 1 },
        state:  { 'in': [ 'NY', 'FL', 'CA' ] },
      },
      routeProps: {
        pathName: '/magic',
      },
      variations: [
        { name: 'Original', weight: 5000 },
        { name: 'Variation #A', weight: 5000 },
        { name: 'Variation #B', weight: 0 }
      ],
    });


    it('exists', () => {
      expect(availableExperiments).to.exist;
      expect(availableExperiments).to.be.a('function');
    });

    it('undefined/blank matches any audience', () => {
      let output = availableExperiments({
        key_path:      ['key'],
        audience:      Immutable.Map(),
        audience_path: ['audienceProps'],
        experiments:   Immutable.List([experiment_0, experiment_a, experiment_a2, experiment_b, experiment_c]),
        route_path:    initialState.get('route_path'),
        route:         initialState.get('route'),
      });
      expect(output).to.be.an.instanceOf(Immutable.Map);
      expect(output.toJS()).to.deep.equal({
        '': [
          'No Audience',
        ],
        'BlankAudienceComponent': [
          'Blank Audience 1', 'Blank Audience 2'
        ],
      });


      output = availableExperiments({
        key_path:      ['key'],
        audience:      Immutable.fromJS({ type: 'new user' }),
        audience_path: ['audienceProps'],
        experiments:   Immutable.List([experiment_0, experiment_a, experiment_a2, experiment_b, experiment_c]),
        route_path:    initialState.get('route_path'),
        route:         initialState.get('route'),
      });
      expect(output).to.be.an.instanceOf(Immutable.Map);
      expect(output.toJS()).to.deep.equal({
        '': [
          'No Audience',
        ],
        'BlankAudienceComponent': [
          'Blank Audience 1', 'Blank Audience 2'
        ],
      });
    });

    it('matches vip', () => {
      const output = availableExperiments({
        key_path:      ['key'],
        audience:      Immutable.fromJS({ type: 'vip' }),
        audience_path: ['audienceProps'],
        experiments:   Immutable.List([experiment_0, experiment_a, experiment_a2, experiment_b, experiment_c]),
        route_path:    initialState.get('route_path'),
        route:         initialState.get('route').merge({pathName: '/magic'}),
      });
      expect(output).to.be.an.instanceOf(Immutable.Map);
      expect(output.toJS()).to.deep.equal({
        '': [
          'No Audience',
        ],
        'BlankAudienceComponent': [
          'Blank Audience 1', 'Blank Audience 2'
        ],
        'SimpleAudienceComponent': [
          'Simple Audience Type',
        ]
      });
    });

    it('matches vip and orders', () => {
      const output = availableExperiments({
        key_path:      ['key'],
        audience:      Immutable.fromJS({ type: 'vip', orders: 10, state: 'NY' }),
        audience_path: ['audienceProps'],
        experiments:   Immutable.List([experiment_0, experiment_a, experiment_a2, experiment_b, experiment_c]),
        route_path:    initialState.get('route_path'),
        route:         initialState.get('route').merge({pathName: '/magic'}),
      });
      expect(output).to.be.an.instanceOf(Immutable.Map);
      expect(output.toJS()).to.deep.equal({
        '': [
          'No Audience',
        ],
        'BlankAudienceComponent': [
          'Blank Audience 1', 'Blank Audience 2'
        ],
        'SimpleAudienceComponent': [
          'Simple Audience Type',
        ],
        'ComplexAudienceComponent': [
          'Complex Audience Type',
        ],
      });
    });
  });

});
