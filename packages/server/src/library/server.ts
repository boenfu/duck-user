import {Server as HTTPServer} from 'http';

import cors from '@koa/cors';
import Koa, {Middleware} from 'koa';
import body from 'koa-bodyparser';
import Router from 'koa-router';
import ms from 'ms';
import requestIp from 'request-ip';

import {DuckAppearance} from './duck';
import {INest} from './nest';

export const DUCK_USER_PORT_DEFAULT = 3000;
export const DUCK_USER_LIFESPAN_DEFAULT = ms('20 m');

export type DuckUserVerifier = (nextKey: string) => Promise<boolean> | boolean;

export interface DuckUserServerOptions {
  nest: INest;
  serve?: {
    httpServer?: HTTPServer;
    koa?: Koa;
    port?: number;
    verifier?: string | DuckUserVerifier;
  };
  /**
   * (ms)
   */
  defaultLifespan?: number;
}

interface ContextWithParams {
  appearance: DuckAppearance;
}

export class DuckUserServer {
  readonly httpServer!: HTTPServer;
  readonly app!: Koa<undefined, ContextWithParams>;
  readonly router = new Router<undefined, ContextWithParams>();

  readonly nest!: INest;

  constructor({
    serve: {
      httpServer = new HTTPServer(),
      koa: app = new Koa(),
      port = DUCK_USER_PORT_DEFAULT,
      verifier,
    } = {},
    defaultLifespan = DUCK_USER_LIFESPAN_DEFAULT,
    nest,
  }: DuckUserServerOptions) {
    let router = this.router;

    app.use(cors()).use(body()).use(nestGate());

    if (verifier !== undefined) {
      app.use(auth(verifier));
    }

    router
      .post('/get', ({appearance}) =>
        Promise.resolve(nest.get(appearance)).then(duck => duck?.meat),
      )
      .post('/set', ({request, appearance}) =>
        nest.set({
          ...appearance,
          meat: request.body.data,
          hatchedAt: Date.now(),
          diedAt: Date.now() + defaultLifespan,
        }),
      );

    app.use(router.routes()).use(router.allowedMethods());

    httpServer.on('request', app.callback());

    if (!httpServer.listening) {
      httpServer.listen(port);
    }

    this.httpServer = httpServer;
    this.app = app as Koa<undefined, ContextWithParams>;
    this.nest = nest;
  }
}

function auth(verifierOrToken: string | DuckUserVerifier): Middleware {
  let verifier =
    typeof verifierOrToken === 'string'
      ? (token: string): boolean => verifierOrToken === token
      : verifierOrToken;

  return async (ctx, next) => {
    const {headers} = ctx.request;

    let [, token] = headers.authorization?.match(/Bearer[\s]*(\S+)[\s]*/) ?? [];

    if (!token || !(await verifier(token))) {
      ctx.throw(403, 'Unauthorized');
      return;
    }

    await next();
  };
}

function nestGate(): Middleware<undefined, ContextWithParams> {
  return async (ctx, next) => {
    let kinds: object = {};
    let ip!: string;

    try {
      ip = requestIp.getClientIp(ctx.request) ?? ctx.request.ip;

      kinds = JSON.parse(JSON.stringify(ctx.request.body.kinds));

      if (!ip || typeof kinds !== 'object' || !Object.keys(kinds).length) {
        throw Error();
      }
    } catch (error) {
      ctx.throw(400, 'Bad Request');
      return;
    }

    let formattedKinds: Record<string, unknown> = {};
    let identifier: Record<string, unknown> = {};

    for (let [kind, value] of Object.entries(kinds)) {
      if (value === null) {
        continue;
      }

      if (kind.startsWith('_')) {
        kind = kind.slice(1);
        identifier[kind] = value;
      } else {
        formattedKinds[kind] = value;
      }
    }

    identifier['ip'] = ip;

    ctx.appearance = {
      identifier,
      kinds: formattedKinds,
    };

    ctx.body = (await next()) ?? {};
  };
}
