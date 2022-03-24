export interface DuckAppearance<
  TKinds extends Record<string, any> = Record<string, any>,
> {
  identifier: (keyof TKinds)[];
  kinds: TKinds;
}

export interface Duck<TMeat extends any = any> extends DuckAppearance {
  meat: TMeat;
  hatchedAt: number;
  lifespan: number;
}
