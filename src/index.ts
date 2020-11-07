import FastifyPlugin from 'fastify-plugin';
import FluentSchema from 'fluent-schema';

import {Options, Schema, validate} from '@core/options';

import 'fastify-sensible';

export * from '@core/options';
export * from '@core/entity';

export interface RouteAuthLogin {
  Body: {
    email: string;
    password: string;
  };
}

export const ERR_LOGIN_FAILED = 'Login failed; Invalid user ID or password';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default FastifyPlugin<Options<any>>(
  async (fastify, options) => {
    validate(options);
    const schema: Schema = {
      body: FluentSchema.object()
        .prop(
          'email',
          FluentSchema.string()
            .format('email')
            .minLength(5)
            .maxLength(256)
            .required()
        )
        .prop(
          'password',
          FluentSchema.string().minLength(8).maxLength(64).required()
        )
        .additionalProperties(false),
      response: {
        200: FluentSchema.object()
          .prop('access_token', FluentSchema.string().required())
          .prop('refresh_token', FluentSchema.string().required())
          .prop('token_type', FluentSchema.string().required())
          .prop('expires_in', FluentSchema.number().required())
          .additionalProperties(false),
        '4xx': FluentSchema.object()
          .prop('error', FluentSchema.string().required())
          .prop('message', FluentSchema.string().required())
          .prop('statusCode', FluentSchema.number().required())
          .additionalProperties(false),
      },
    };
    if (options.getSchema !== undefined) {
      options.getSchema(schema);
    }
    fastify.post<RouteAuthLogin>(
      options.path !== undefined ? options.path : '/auth/login',
      {
        schema: schema,
      },
      async (request, reply) => {
        try {
          let payload = undefined;
          if (options.getPayload !== undefined) {
            payload = options.getPayload(request, reply);
          }
          const {email, password} = request.body;
          const user = await options.getUser(email, password, payload);
          if (user === undefined) {
            return reply.unauthorized(ERR_LOGIN_FAILED);
          }
          const token = await options.getToken(user, payload);
          if (token === undefined) {
            return reply.unauthorized(ERR_LOGIN_FAILED);
          }
          return token;
        } catch (err) {
          reply.log.error(err);
          reply.unauthorized(ERR_LOGIN_FAILED);
        }
      }
    );
  },
  {
    fastify: '3.x',
    dependencies: ['fastify-sensible'],
  }
);
