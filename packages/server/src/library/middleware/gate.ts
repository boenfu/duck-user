import {Middleware} from 'koa';
import requestIp from 'request-ip';

import {KoaContextWithDuckAppearance} from '../context';

export function nestGate(): Middleware<
  undefined,
  KoaContextWithDuckAppearance
> {
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

    await next();
  };
}
