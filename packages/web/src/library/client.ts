import {MobileDeviceKindsOptions, getKinds} from './@kinds';
import {nanoid} from './@utils';

export interface DuckUserEnv extends MobileDeviceKindsOptions {}

export interface DuckUserOptions {
  server: string;
  token?: string;
  env?: DuckUserEnv;
}

export interface DuckUserExtraKinds {
  _nanoid?: string;
}

export class DuckUser<TData = any> {
  constructor(private options: DuckUserOptions) {}

  async set<TTData = TData>(data: TTData): Promise<string> {
    let id = nanoid();

    await this.request(
      'set',
      {
        ...data,
      },
      {
        _nanoid: id,
      },
    );

    return id;
  }

  async get<TTData = TData>(
    extraKinds: DuckUserExtraKinds = {},
  ): Promise<TTData> {
    return this.request<TTData>('get', undefined, extraKinds);
  }

  private request<T>(
    path: string,
    data: any,
    extraKinds: DuckUserExtraKinds,
  ): Promise<T> {
    let {server, token, env} = this.options;

    return fetch(`${server}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify({
        kinds: {
          ...getKinds(env),
          ...extraKinds,
        },
        data,
      }),
    }).then(response => response.json());
  }
}
