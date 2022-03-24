import {Duck, DuckAppearance} from '../duck';

export interface INest {
  bring(duck: Duck): Promise<void> | void;
  take(appearance: DuckAppearance): Promise<Duck> | Duck;
  bury(duck: Duck): Promise<void> | void;
}
