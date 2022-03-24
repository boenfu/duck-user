import {Duck, DuckAppearance} from '../duck';

import {INest} from './nest';

export class MemoryNest implements INest {
  bring(duck: Duck): void | Promise<void> {
    throw new Error('Method not implemented.');
  }

  take(appearance: DuckAppearance): Duck | Promise<Duck> {
    throw new Error('Method not implemented.');
  }

  bury(duck: Duck): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
}
