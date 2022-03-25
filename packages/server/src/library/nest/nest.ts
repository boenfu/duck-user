import {Duck, DuckAppearance} from '../duck';

export interface INest {
  set(duck: Duck): Promise<void> | void;
  get(duck: DuckAppearance): Promise<Duck | undefined> | Duck | undefined;
  destroy?(duck: Duck): Promise<void> | void;
}
