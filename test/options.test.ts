import {expect} from 'chai';
import {describe, it} from 'mocha';
import {validate} from '@core/options';

describe('test options', () => {
  it('assert expect "require options"', async () => {
    expect(() => {
      validate(undefined as never);
    }).to.throw('require options');
  });

  it('assert expect "require options.getUser"', async () => {
    expect(() => {
      validate({
        getUser: undefined as never,
        getToken: undefined as never,
      });
    }).to.throw('require options.getUser');
  });
  it('assert expect "require Promise... in options.getUser"', async () => {
    expect(() => {
      validate({
        getUser: 'never' as never,
        getToken: async () => undefined,
      });
    }).to.throw('require Promise<TokenResult | undefined> in options.getUser');
  });

  it('assert expect "require options.getToken"', async () => {
    expect(() => {
      validate({
        getUser: async () => undefined,
        getToken: undefined as never,
      });
    }).to.throw('require options.getToken');
  });
  it('assert expect "require Promise... in options.getToken"', async () => {
    expect(() => {
      validate({
        getUser: async () => undefined,
        getToken: 'never' as never,
      });
    }).to.throw('require Promise<TokenResult | undefined> in options.getToken');
  });

  it('assert expect "require function in options.getSchema"', async () => {
    expect(() => {
      validate({
        getUser: async () => undefined,
        getToken: async () => undefined,
        getSchema: 'never' as never,
      });
    }).to.throw('require function in options.getSchema');
  });
  it('assert not expect "require function in options.getSchema"', async () => {
    expect(() => {
      validate({
        getUser: async () => undefined,
        getToken: async () => undefined,
        getSchema: schema => schema,
      });
    }).to.not.throw('require function in options.getSchema');
  });

  it('assert expect "require function in options.getPayload"', async () => {
    expect(() => {
      validate({
        getUser: async () => undefined,
        getToken: async () => undefined,
        getPayload: 'never' as never,
      });
    }).to.throw('require function in options.getPayload');
  });
  it('assert not expect "require function in options.getPayload"', async () => {
    expect(() => {
      validate({
        getUser: async () => undefined,
        getToken: async () => undefined,
        getPayload: schema => schema,
      });
    }).to.not.throw('require function in options.getPayload');
  });

  it('assert expect "require string in options.path"', async () => {
    expect(() => {
      validate({
        getUser: async () => undefined,
        getToken: async () => undefined,
        path: true as never,
      });
    }).to.throw('require string in options.path');
  });
  it('assert not expect "require string in options.path"', async () => {
    expect(() => {
      validate({
        getUser: async () => undefined,
        getToken: async () => undefined,
        path: '/auth',
      });
    }).to.not.throw('require string in options.path');
  });

  it('assert ok"', async () => {
    expect(() => {
      validate({
        getUser: async () => undefined,
        getToken: async () => undefined,
      });
    }).to.not.throw();
  });
});
