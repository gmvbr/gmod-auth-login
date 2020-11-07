import {expect} from 'chai';
import {describe, it} from 'mocha';

import Plugin, {ERR_LOGIN_FAILED, Options} from '@main';
import fastify from 'fastify';

import FluentSchema from 'fluent-schema';
import FastifySensible from 'fastify-sensible';

import {user, error, inject} from './helper';

async function getInstance<E>(options: Options<E>) {
  const app = fastify();
  app.register(FastifySensible);
  app.register(Plugin, options);
  await app.listen(0);
  return app;
}

describe('test plugin', () => {
  it('expect "new prop other in schema"', async () => {
    const app = await getInstance({
      getSchema(schema) {
        Object.assign(schema, {
          body: schema.body.prop('other', FluentSchema.string().required()),
        });
      },
      getUser: async () => undefined,
      getToken: async () => undefined,
    });
    const request = await app.inject(inject);
    expect(request.statusCode).to.equal(400);
    expect(request.json()).to.deep.equals({
      statusCode: 400,
      error: 'Bad Request',
      message: "body should have required property 'other'",
    });
    await app.close();
  });

  it('expect "other path"', async () => {
    const app = await getInstance({
      path: '/auth',
      getUser: async () => undefined,
      getToken: async () => undefined,
    });
    const request = await app.inject({
      method: 'POST',
      path: '/auth',
      payload: user,
    });
    expect(request.statusCode).to.equal(401);
    expect(request.json()).to.deep.equals(error);
    await app.close();
  });

  it('expect "getPayload != undefined', async () => {
    const app = await getInstance({
      getPayload() {
        return {
          sum: 20,
        };
      },
      async getUser(_email, _password, payload) {
        expect(payload).to.deep.equals({
          sum: 20,
        });
        return undefined;
      },
      getToken: async () => undefined,
    });
    const request = await app.inject(inject);
    expect(request.statusCode).to.equal(401);
    expect(request.json()).to.deep.equals(error);
    await app.close();
  });

  it('expect error', async () => {
    const app = await getInstance({
      async getUser() {
        throw new Error(ERR_LOGIN_FAILED);
      },
      getToken: async () => undefined,
    });
    const request = await app.inject(inject);

    expect(request.statusCode).to.equal(401);
    expect(request.json()).to.deep.equals(error);

    await app.close();
  });

  it('expect "user === undefined"', async () => {
    const app = await getInstance({
      async getUser(email, password) {
        expect(email).to.equal(user.email);
        expect(password).to.equal(user.password);
        return undefined;
      },
      getToken: async () => undefined,
    });
    const request = await app.inject(inject);
    expect(request.statusCode).to.equal(401);
    expect(request.json()).to.deep.equals(error);
    await app.close();
  });

  it('expect "token === undefined"', async () => {
    const app = await getInstance({
      async getUser(email, password) {
        expect(email).to.equal(user.email);
        expect(password).to.equal(user.password);
        return {
          id: '1000',
          email: user.email,
        };
      },
      getToken: async () => undefined,
    });
    const request = await app.inject(inject);
    expect(request.statusCode).to.equal(401);
    expect(request.json()).to.deep.equals(error);
    await app.close();
  });

  it('expect token', async () => {
    const app = await getInstance({
      async getUser(email, password) {
        expect(email).to.equal(user.email);
        expect(password).to.equal(user.password);
        return {
          id: '1000',
          email: user.email,
        };
      },
      async getToken(user) {
        expect(user).to.deep.equals({
          id: '1000',
          email: user.email,
        });
        return {
          refresh_token: 'refresh',
          access_token: 'access',
          token_type: 'test',
          expires_in: 3600,
          sensible: 'sensible information',
        };
      },
    });
    const request = await app.inject(inject);
    expect(request.statusCode).to.equal(200);
    expect(request.json()).to.deep.equals({
      refresh_token: 'refresh',
      access_token: 'access',
      token_type: 'test',
      expires_in: 3600,
    });
    await app.close();
  });
});
