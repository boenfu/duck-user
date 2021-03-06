import cors from '@koa/cors';
import Koa, {Middleware} from 'koa';
import body from 'koa-bodyparser';
import mount from 'koa-mount';
import Router, {IMiddleware} from 'koa-router';
import ms from 'ms';

import {KoaContextWithDuckAppearance} from './context';
import {DuckUserVerifier, auth, nestGate} from './middleware';
import {INest} from './nest';

export const DUCK_USER_PORT_DEFAULT = 3000;
export const DUCK_USER_LIFESPAN_DEFAULT = ms('20 m');

export interface DuckUserServerOptions {
  nest: INest;
  serve?: {
    koa?: Koa;
    port?: number;
    verifier?: string | DuckUserVerifier;
    middleware?: IMiddleware<undefined, KoaContextWithDuckAppearance>[];
  };
  /**
   * (ms)
   */
  defaultLifespan?: number;
}

export class DuckUserServer {
  readonly app: Koa<undefined, KoaContextWithDuckAppearance> = new Koa();
  readonly router = new Router<undefined, KoaContextWithDuckAppearance>();

  readonly nest!: INest;

  private options!: {
    port: number;
  };

  constructor({
    serve: {port = DUCK_USER_PORT_DEFAULT, verifier, middleware = []} = {},
    defaultLifespan = DUCK_USER_LIFESPAN_DEFAULT,
    nest,
  }: DuckUserServerOptions) {
    let app = this.app;
    let router = this.router;

    app.use(cors()).use(body()).use(nestGate());

    if (verifier !== undefined) {
      app.use(auth(verifier));
    }

    router
      .post(
        '/get',
        ...middleware,
        response(({appearance}) =>
          Promise.resolve(nest.get(appearance)).then(duck => duck?.meat),
        ),
      )
      .post(
        '/set',
        ...middleware,
        response(({request, appearance}) =>
          nest.set({
            ...appearance,
            meat: request.body.data,
            hatchedAt: Date.now(),
            diedAt: Date.now() + defaultLifespan,
          }),
        ),
      );

    app.use(router.routes()).use(router.allowedMethods());

    this.nest = nest;
    this.options = {
      port,
    };
  }

  start(port = this.options.port): void {
    this.app.listen(port, () => {
      console.info(`duck user server listening on port ${port}`);
    });
  }

  static middleware(
    path: string,
    options: DuckUserServerOptions,
  ): Middleware<undefined, KoaContextWithDuckAppearance> {
    return mount(path, new DuckUserServer(options).app);
  }
}

function response(
  fn: Middleware<undefined, KoaContextWithDuckAppearance>,
): Middleware<undefined, KoaContextWithDuckAppearance> {
  return async (ctx, ...args) => {
    ctx.body = (await fn(ctx, ...args)) ?? {};
  };
}
