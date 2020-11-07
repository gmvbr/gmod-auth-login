import Plugin, {ERR_LOGIN_FAILED, Options} from '@main';
import fastify from 'fastify';

import FastifySensible from 'fastify-sensible';

import {InjectOptions} from 'light-my-request';

export const user = {
  email: 'admin@admin.op',
  password: 'admin123',
};

export const inject: InjectOptions = {
  method: 'POST',
  path: '/auth/login',
  payload: user,
};

export const error = {
  statusCode: 401,
  error: 'Unauthorized',
  message: ERR_LOGIN_FAILED,
};

export async function getInstance<E>(options: Options<E>) {
  const app = fastify();
  app.register(FastifySensible);
  app.register(Plugin, options);
  await app.listen(0);
  return app;
}
