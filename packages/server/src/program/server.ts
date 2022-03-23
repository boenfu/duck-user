import {Server as HTTPServer} from 'http';

import cors from '@koa/cors';
import Koa, {Middleware} from 'koa';
import body from 'koa-bodyparser';
import Router from 'koa-router';
import requestIp from 'request-ip';

import {INest, MemoryNest} from './nest';

export const DUCK_USER_PORT_DEFAULT = 3000;

export type DuckUserVerifier = (nextKey: string) => Promise<boolean> | boolean;

export interface DuckUserOptions {
  serve?: {
    httpServer?: HTTPServer;
    koa?: Koa;
    port?: number;
    verifier?: string | DuckUserVerifier;
  };
  nest?: INest;
  /**
   * default: false
   * If true, will not ignore undefined source when compare.
   */
  strict?: boolean;
  /**
   * (ms)
   */
  userLifeCycle?: number;
}

interface ContextWithParams {
  realIp: string | null;
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
  }: DuckUserOptions = {}) {
    let router = this.router;

    router.all('/enter', ctx => {
      ctx.body = '1';
    });

    app.use(cors()).use(body()).use(realIp());

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

function auth(verifierOrDuckUserKey: string | DuckUserVerifier): Middleware {
  let verifier =
    typeof verifierOrDuckUserKey === 'string'
      ? (duckUserKey: string): boolean => verifierOrDuckUserKey === duckUserKey
      : verifierOrDuckUserKey;

  return async (ctx, next) => {
    const {headers} = ctx.request;

    let [, duckUserKey] =
      headers.authorization?.match(/Bearer[\s]*(\S+)[\s]*/) ?? [];

    if (!duckUserKey || !(await verifier(duckUserKey))) {
      ctx.throw(403);
      return;
    }

    await next();
  };
}

function realIp(): Middleware<undefined, ContextWithParams> {
  return async (ctx, next) => {
    ctx.realIp = requestIp.getClientIp(ctx.request);
    await next();
  };
}
