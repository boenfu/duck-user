import {Server as HTTPServer} from 'http';

import cors from '@koa/cors';
import Koa, {Middleware} from 'koa';
import body from 'koa-bodyparser';
import Router from 'koa-router';
import requestIp from 'request-ip';

import {INest, MemoryNest} from './nest';

export const DUCK_USER_PORT_DEFAULT = 3000;

export type DuckUserVerifier = (nextKey: string) => Promise<boolean> | boolean;

export interface DuckUserServerOptions {
  serve?: {
    httpServer?: HTTPServer;
    koa?: Koa;
    port?: number;
    verifier?: string | DuckUserVerifier;
  };
  nest?: INest;
  /**
   * (ms)
   */
  defaultLifespan?: number;
}

interface ContextWithParams {
  kinds: object;
  identifier: string[];
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
    nest = new MemoryNest(),
  }: DuckUserServerOptions = {}) {
    let router = this.router;

    app.use(cors()).use(body()).use(nestGate());

    if (verifier !== undefined) {
      app.use(auth(verifier));
    }

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
    let realIp = requestIp.getClientIp(ctx.request);
    let kinds = JSON.parse(JSON.stringify(ctx.body.kinds));

    if (!realIp || typeof kinds !== 'object' || !Object.keys(kinds).length) {
      ctx.throw(400, 'Bad Request');
      return;
    }

    let formattedKinds: Record<string, unknown> = {};
    let identifier: string[] = [];

    for (let [kind, value] of Object.entries(kinds)) {
      if (kind.startsWith('_')) {
        kind = kind.slice(1);
        formattedKinds[kind] = value;
        identifier.push(kind);
      } else {
        formattedKinds[kind] = value;
      }
    }

    formattedKinds['ip'] = realIp;
    identifier.push('ip');

    ctx.kinds = kinds;
    ctx.identifier = identifier;

    await next();
  };
}
