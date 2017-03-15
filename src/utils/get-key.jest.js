import Immutable from 'immutable';
import getKey from './get-key';

describe('utils/get-key.js', () => {
  it('exists', () => {
    expect(getKey).not.toBeUndefined;
    expect(typeof getKey).toEqual('function');
  });

  it('chooses the :id when availble', () => {
    expect(getKey(Immutable.Map({ id: 'test-id', name: 'Test-Name' }))).toEqual('test-id');
  });

  it('chooses the :name when :id is undefined', () => {
    expect(getKey(Immutable.Map({ id: undefined, name: 'Test-Name' }))).toEqual('Test-Name');
  });

  it('chooses the :name when :id is null', () => {
    expect(getKey(Immutable.Map({ id: null, name: 'Test-Name' }))).toEqual('Test-Name');
  });

  it('chooses the :name when :id is falsy', () => {
    expect(getKey(Immutable.Map({ id: false, name: 'Test-Name' }))).toEqual('Test-Name');
  });

  it('chooses the :name when :id not set', () => {
    expect(getKey(Immutable.Map({ name: 'Test-Name' }))).toEqual('Test-Name');
  });

  it('returns null when id and name are not defined', () => {
    expect(getKey(Immutable.Map({}))).toBeNull;
  });
});
