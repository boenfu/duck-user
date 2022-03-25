export interface DuckAppearance {
  identifier: Record<string, any>;
  kinds: Record<string, any>;
}

export interface Duck<TMeat extends any = any> extends DuckAppearance {
  meat: TMeat;
  hatchedAt: number;
  diedAt: number;
}
