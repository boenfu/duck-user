import {Middleware} from 'koa';

export type DuckUserVerifier = (nextKey: string) => Promise<boolean> | boolean;

export function auth(verifierOrToken: string | DuckUserVerifier): Middleware {
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
