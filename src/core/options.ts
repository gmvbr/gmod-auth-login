import * as assert from 'assert';
import {ObjectSchema} from 'fluent-schema';

import {FastifyReply, FastifyRequest, FastifySchema} from 'fastify';
import {TokenResult, UserResult} from '@core/entity';

export interface Schema extends FastifySchema {
  body: ObjectSchema;
  response: {
    200: ObjectSchema;
    '4xx': ObjectSchema;
  };
}

export interface Options<E> {
  path?: string | undefined;
  getSchema?: (schema: Schema) => void;
  getPayload?: (request: FastifyRequest, reply: FastifyReply) => E;
  getUser: (
    email: string,
    password: string,
    payload: E
  ) => Promise<UserResult | undefined>;
  getToken: (user: UserResult, payload: E) => Promise<TokenResult | undefined>;
}

export function validate<E>(options: Options<E>) {
  assert(options, 'require options');
  assert(options.getUser, 'require options.getUser');
  assert.strictEqual(
    typeof options.getUser,
    'function',
    'require Promise<TokenResult | undefined> in options.getUser'
  );
  assert(options.getToken, 'require options.getToken');
  assert.strictEqual(
    typeof options.getToken,
    'function',
    'require Promise<TokenResult | undefined> in options.getToken'
  );
  if (options.getSchema !== undefined) {
    assert.strictEqual(
      typeof options.getSchema,
      'function',
      'require function in options.getSchema'
    );
  }
  if (options.getPayload !== undefined) {
    assert.strictEqual(
      typeof options.getPayload,
      'function',
      'require function in options.getPayload'
    );
  }
  if (options.path !== undefined) {
    assert.strictEqual(
      typeof options.path,
      'string',
      'require string in options.path'
    );
  }
}
