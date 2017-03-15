import Immutable from 'immutable';
import { initialState } from '../module';
import availableExperiments, { matchesField, matchesAudience, matchesRoute } from './available-experiments';


describe('utils/available-experiments.js', () => {
  describe('matchesField', () => {
    it('exists', () => {
      expect(matchesField).not.toBeUndefined;
      expect(typeof matchesField).toEqual('function');
    });

    it('has the correct output for ===', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '===', 10)).toBeTruthy;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '===', 0)).toBeFalsy;
    });

    it('has the correct output for >=', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '>=', 10)).toBeTruthy;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '>=', 11  )).toBeFalsy;
    });

    it('has the correct output for >', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '>', 9)).toBeTruthy;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '>', 10)).toBeFalsy;
    });

    it('has the correct output for <=', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '<=', 10)).toBeTruthy;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '<=', 9)).toBeFalsy;
    });

    it('has the correct output for <', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '<', 11)).toBeTruthy;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', '<', 10)).toBeFalsy;
    });

    it('has the correct output for in', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', 'in', [9, 10, 11])).toBeTruthy;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', 'in', [0])).toBeFalsy;
    });

    it('has the correct output for not in', () => {
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', 'not in', [1])).toBeTruthy;
      expect(matchesField(Immutable.fromJS({ orders: 10}), 'orders', 'not in', [10])).toBeFalsy;
    });

    it('has the correct output for not intersect', () => {
      expect(matchesField(Immutable.fromJS({ orders: [1, 10, 20] }), 'orders', 'intersect', [10] )).toBeTruthy;
      expect(matchesField(Immutable.fromJS({ orders: [10]        }), 'orders', 'intersect',  10  )).toBeTruthy;
      expect(matchesField(Immutable.fromJS({ orders: 10          }), 'orders', 'intersect',  10  )).toBeTruthy;
      expect(matchesField(Immutable.fromJS({ orders: [0, 15, 20] }), 'orders', 'intersect', [10] )).toBeFalsy;
      expect(matchesField(Immutable.fromJS({ orders: []          }), 'orders', 'intersect', [10] )).toBeFalsy;
      expect(matchesField(Immutable.fromJS({ orders: []          }), 'orders', 'intersect',  10  )).toBeFalsy;
    });
  });


  describe('matchesRoute', () => {
    const blankRoute    = initialState.get('route');
    const homepageRoute = initialState.get('route').merge({ pathName: '/', path: '/' });
    const dynamicRoute  = initialState.get('route').merge({ pathName: '/posts/2', path: '/posts:id', params: { 'id': '2' } });
    const utmsRoute     = initialState.get('route').merge({ pathName: '/magic', query: { 'utm_campaign': 'test-campaignName', 'utm_source': 'harry-potter' } });

    it('exists', () => {
      expect(matchesRoute).not.toBeUndefined;
      expect(typeof matchesRoute).toEqual('function');
    });

    it('undefined matches any route', () => {
      expect(matchesRoute( blankRoute, undefined )).toBeTruthy;
    });

    it('null matches any route', () => {
      expect(matchesRoute( blankRoute, null )).toBeTruthy;
    });

    it('empty hash matches any route', () => {
      expect(matchesRoute( homepageRoute, Immutable.fromJS({}) )).toBeTruthy;
    });

    it('exactly matches pathName', () => {
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName:              '/'                }  ) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/']               } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/', '/magic']     } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/', '/404']       } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'not in': ['/404', '/magic']  } }) )).toBeTruthy; // eslint-disable-line
    });

    it('doesnt match pathName', () => {
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName:              '/404'              }  ) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/404']             } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/404', '/magic']   } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'in':     ['/404', '/404']     } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(homepageRoute,   Immutable.fromJS({ pathName: { 'not in': ['/', '/help']       } }) )).toBeFalsy; // eslint-disable-line
    });

    it('exactly matches path', () => {
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path:              '/posts:id'              }  ) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/posts:id']             } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/posts:id', '/magic']   } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/posts:id', '/404']     } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'not in': ['/404', '/help']         } }) )).toBeTruthy; // eslint-disable-line
    });

    it('doesnt match path', () => {
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path:              '/404'                 }  ) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/404']                } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/404', '/magic']      } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'in':     ['/404', '/help']       } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: { 'not in': ['/posts:id', '/help']  } }) )).toBeFalsy; // eslint-disable-line
    });

    it('exactly matches path with params', () => {
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id':              '2'              }}  ) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['2']             }} }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['2', 'slug']     }} }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['2', '3']        }} }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'not in': ['404']           }} }) )).toBeTruthy; // eslint-disable-line
    });

    it('doesnt match path with missing params', () => {
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'invalid-param': 'n/a'              } }) )).toBeFalsy; // eslint-disable-line
    });

    it('doesnt match path with params', () => {
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id':              '3'              }}  ) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['3']             }} }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['3', 'slug']     }} }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'in':     ['3', '15']       }} }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(dynamicRoute,    Immutable.fromJS({ path: '/posts:id', params: { 'id': { 'not in': ['2']             }} }) )).toBeFalsy; // eslint-disable-line
    });

    it('exactly matches pathName with query', () => {
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign':              'test-campaignName'              }}  ) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign': { 'in':     ['test-campaignName']             }} }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign': { 'in':     ['test-campaignName', 'slug']     }} }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign': { 'in':     ['test-campaignName', '3']        }} }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign': { 'not in': ['404']                           }} }) )).toBeTruthy; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'id':           { 'not in': ['2']                             }} }) )).toBeTruthy; // eslint-disable-line
    });

    it('doesnt match pathName with missing query', () => {
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'invalid-param': 'n/a'              } }) )).toBeFalsy; // eslint-disable-line
    });

    it('doesnt match pathName with query', () => {
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'id':                        '3'                  }}  ) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'id':           { 'in':     ['3']                 }} }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'id':           { 'in':     ['3', 'slug']         }} }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'id':           { 'in':     ['3', '15']           }} }) )).toBeFalsy; // eslint-disable-line
      expect(matchesRoute(utmsRoute,    Immutable.fromJS({ pathName: '/magic', query: { 'utm_campaign': { 'not in': ['test-campaignName'] }} }) )).toBeFalsy; // eslint-disable-line
    });
  });


  describe('matchesAudience', () => {
    const blankAudience   = Immutable.fromJS({});
    const vipAudience     = Immutable.fromJS({ type: 'vip' });
    const stateAudience   = Immutable.fromJS({ type: 'vip', state: 'NY' });
    const ordersAudience  = Immutable.fromJS({ type: 'vip', orders: 10  });
    const specialAudience = Immutable.fromJS({ type: 'vip', orders: 10, state: 'CA' });

    it('exists', () => {
      expect(matchesAudience).not.toBeUndefined;
      expect(typeof matchesAudience).toEqual('function');
    });

    it('undefined matches any audience', () => {
      expect(matchesAudience( blankAudience, undefined )).toBeTruthy;
    });

    it('null matches any audience', () => {
      expect(matchesAudience( blankAudience, null )).toBeTruthy;
    });

    it('empty hash matches any audience', () => {
      expect(matchesAudience( vipAudience, Immutable.fromJS({}) )).toBeTruthy;
    });

    it('matches on state', () => {
      expect(matchesAudience(stateAudience,   Immutable.fromJS({ state:             'NY'           }  ) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(stateAudience,   Immutable.fromJS({ state: { 'in':     ['NY']         } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(stateAudience,   Immutable.fromJS({ state: { 'in':     ['NY', 'N/A']  } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(stateAudience,   Immutable.fromJS({ state: { 'in':     ['NY', 'DC']   } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(stateAudience,   Immutable.fromJS({ state: { 'not in': ['N/A']        } }) )).toBeTruthy; // eslint-disable-line
    });

    it('doesnt match on state', () => {
      expect(matchesAudience(blankAudience, Immutable.fromJS({ type:             'ny'           }  ) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(stateAudience, Immutable.fromJS({ type:             'ny'           }  ) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(stateAudience, Immutable.fromJS({ type: { 'in':     ['ny']         } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(stateAudience, Immutable.fromJS({ type: { 'in':     ['ny']         } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(stateAudience, Immutable.fromJS({ type: { 'in':     ['ny', 'ca']   } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(stateAudience, Immutable.fromJS({ type: { 'in':     ['ny', 'ca']   } }) )).toBeFalsy; // eslint-disable-line
      // expect(matchesAudience(stateAudience, Immutable.fromJS({ type: { 'not in': ['ny', 'NY']   } }) )).toBeFalsy; // eslint-disable-line TODO -> fixme?
    });

    it('matches on vip', () => {
      // Exactly matches on 'vip'
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type:             'vip'           }  ) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['vip']         } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['vip', '1pct'] } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['vip', '1pct'] } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'not in': ['loggedout']   } }) )).toBeTruthy; // eslint-disable-line
    });

    it('doesnt match on VIP', () => {
      // Is case sensitive: 'vip' !=== 'VIP'
      expect(matchesAudience(blankAudience, Immutable.fromJS({ type:             'VIP'           }  ) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type:             'VIP'           }  ) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['VIP']         } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['VIP']         } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['VIP', '1PCT'] } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'in':     ['VIP', '1PCT'] } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(vipAudience,   Immutable.fromJS({ type: { 'not in': ['vip']         } }) )).toBeFalsy; // eslint-disable-line
    });

    it('matches on orders', () => {
      // Exactly matches on 'orders'
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders:              10           }  ) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '===':     10           } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>=':      10           } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>=':       0           } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>':        0           } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<=':      10           } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<=':      11           } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { 'in':     [10, 11, 9]   } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { 'not in': [1, 2, 3]     } }) )).toBeTruthy; // eslint-disable-line
    });

    it('matches on a range of orders', () => {
      // Inside a range
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>=': 5,  '<=': 15 } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>':  9,  '<':  11 } }) )).toBeTruthy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>':  9,  '<':  11 } }) )).toBeTruthy; // eslint-disable-line

      // Outside of a range
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<=': 5,  '>=': 15 } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<':  9,  '>':  11 } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<':  9,  '>':  11 } }) )).toBeFalsy; // eslint-disable-line
    });

    it('doesnt match on orders', () => {
      expect(matchesAudience(blankAudience,  Immutable.fromJS({ orders:               1           }  ) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '===':    -10           } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>=':      11           } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '>':       11           } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<=':       9           } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<=':       0           } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<':        0           } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { '<':       10           } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { 'in':     [1, 2, 3]     } }) )).toBeFalsy; // eslint-disable-line
      expect(matchesAudience(ordersAudience, Immutable.fromJS({ orders: { 'not in': [10, 11, 9]   } }) )).toBeFalsy; // eslint-disable-line
    });

    it('exactly matches vip, orders, and state', () => {
      expect(matchesAudience(specialAudience, Immutable.fromJS({}) )).toBeTruthy;
      expect(matchesAudience(specialAudience, Immutable.fromJS({ type: 'vip', orders: { '>=': 5, '<=': 15 }, state: { 'in': ['NY', 'CA', 'FL'] } }) )).toBeTruthy;
    });
  });


  describe('availableExperiments', () => {
    const experiment_0 = Immutable.fromJS({
      name:       'No Audience',
      variations: [
        { name: 'Original', weight: 5000 },
        { name: 'Variation #A', weight: 5000 },
        { name: 'Variation #B', weight: 0 },
      ],
    });

    const experiment_a = Immutable.fromJS({
      key:           'BlankAudienceComponent',
      name:          'Blank Audience 1',
      audienceProps: {},
      variations:    [
        { name: 'Original', weight: 5000 },
        { name: 'Variation #A', weight: 5000 },
        { name: 'Variation #B', weight: 0 },
      ],
    });

    const experiment_a2 = Immutable.fromJS({
      key:           'BlankAudienceComponent',
      name:          'Blank Audience 2',
      persistentExperience: true,
      audienceProps: {},
      variations:    [
        { name: 'Original', weight: 5000 },
        { name: 'Variation #A', weight: 5000 },
        { name: 'Variation #B', weight: 0 },
      ],
    });

    const experiment_b = Immutable.fromJS({
      key:           'SimpleAudienceComponent',
      name:          'Simple Audience Type',
      audienceProps: {
        type: 'vip',
      },
      routeProps: {
        pathName: { in: ['/magic', '/'] },
      },
      variations: [
        { name: 'Original', weight: 5000 },
        { name: 'Variation #A', weight: 5000 },
        { name: 'Variation #B', weight: 0 },
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
        { name: 'Variation #B', weight: 0 },
      ],
    });

    const experiment_d = Immutable.fromJS({
      key:           'ComplexAudienceComponent',
      name:          'Single Success Type',
      singleSuccess: true,
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
        { name: 'Variation #B', weight: 0 },
      ],
    });


    it('exists', () => {
      expect(availableExperiments).not.toBeUndefined;
      expect(typeof availableExperiments).toEqual('function');
    });

    it('undefined/blank matches any audience', () => {
      let output = availableExperiments({
        key_path:           ['key'],
        active:             Immutable.Map(),
        fulfilled:          Immutable.List(),
        persistent_path:    ['persistentExperience'],
        audience:           Immutable.Map(),
        audience_path:      ['audienceProps'],
        experiments:        Immutable.List([experiment_0, experiment_a, experiment_a2, experiment_b, experiment_c]),
        route_path:         initialState.get('route_path'),
        route:              initialState.get('route'),
      });
      expect(Immutable.Map.isMap(output)).toBeTruthy;
      expect(output.toJS()).toEqual({
        'No Audience': 'No Audience',
        'BlankAudienceComponent': 'Blank Audience 1',
      });
    });

    it('undefined/blank gives preference to active w/persistentExperience', () => {
      let output = availableExperiments({
        key_path:           ['key'],
        active:             Immutable.Map({
          'Blank Audience 2': 'Variation #A',
        }),
        fulfilled:          Immutable.List(),
        persistent_path:    ['persistentExperience'],
        audience:           Immutable.fromJS({ type: 'new user' }),
        audience_path:      ['audienceProps'],
        experiments:        Immutable.List([experiment_0, experiment_a, experiment_a2, experiment_b, experiment_c]),
        route_path:         initialState.get('route_path'),
        route:              initialState.get('route'),
      });
      expect(Immutable.Map.isMap(output)).toBeTruthy;
      expect(output.toJS()).toEqual({
        'No Audience': 'No Audience',
        'BlankAudienceComponent': 'Blank Audience 2',
      });
    });

    it('matches vip', () => {
      const output = availableExperiments({
        key_path:           ['key'],
        active:             Immutable.Map(),
        fulfilled:          Immutable.List(),
        persistent_path:    ['persistentExperience'],
        audience:           Immutable.fromJS({ type: 'vip' }),
        audience_path:      ['audienceProps'],
        experiments:        Immutable.List([experiment_0, experiment_a, experiment_a2, experiment_b, experiment_c]),
        route_path:         initialState.get('route_path'),
        route:              initialState.get('route').merge({pathName: '/magic'}),
      });
      expect(Immutable.Map.isMap(output)).toBeTruthy;
      expect(output.toJS()).toEqual({
        'No Audience': 'No Audience',
        'BlankAudienceComponent': 'Blank Audience 1',
        'SimpleAudienceComponent': 'Simple Audience Type',
      });
    });

    it('matches vip and orders', () => {
      const output = availableExperiments({
        key_path:           ['key'],
        active:             Immutable.Map(),
        fulfilled:          Immutable.List(),
        persistent_path:    ['persistentExperience'],
        audience:           Immutable.fromJS({ type: 'vip', orders: 10, state: 'NY' }),
        audience_path:      ['audienceProps'],
        experiments:        Immutable.List([experiment_0, experiment_a, experiment_a2, experiment_b, experiment_c]),
        route_path:         initialState.get('route_path'),
        route:              initialState.get('route').merge({pathName: '/magic'}),
      });
      expect(Immutable.Map.isMap(output)).toBeTruthy;
      expect(output.toJS()).toEqual({
        'No Audience': 'No Audience',
        'BlankAudienceComponent': 'Blank Audience 1',
        'SimpleAudienceComponent': 'Simple Audience Type',
        'ComplexAudienceComponent': 'Complex Audience Type',
      });
    });

    it('experiment_d matches vip and orders', () => {
      let args = {
        key_path:           ['key'],
        active:             Immutable.Map(),
        fulfilled:          Immutable.List(),
        persistent_path:    ['persistentExperience'],
        audience:           Immutable.fromJS({ type: 'vip', orders: 10, state: 'NY' }),
        audience_path:      ['audienceProps'],
        experiments:        Immutable.List([experiment_d]),
        route_path:         initialState.get('route_path'),
        route:              initialState.get('route').merge({pathName: '/magic'}),
      };
      let output = availableExperiments(args);
      expect(Immutable.Map.isMap(output)).toBeTruthy;
      expect(output.toJS()).toEqual({
        'ComplexAudienceComponent': 'Single Success Type',
      });

      // if fulfilled, it is excluded from the output
      output = availableExperiments({
        ...args,
        fulfilled:          Immutable.List('Single Success Type'),
      });
      expect(Immutable.Map.isMap(output)).toBeTruthy;
      expect(output.toJS()).toEqual({
        // Remove this if you un-comment the winner and single_success_path params to availableExperiments
        //   'Single Success Type': 'Original',
        'ComplexAudienceComponent': 'Single Success Type',
      });
    });
  });

});
