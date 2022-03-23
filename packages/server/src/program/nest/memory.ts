import {INest} from './nest';

export class MemoryNest implements INest {
  enter(): void {
    throw new Error('Method not implemented.');
  }

  peek(): void {
    throw new Error('Method not implemented.');
  }

  leave(): void {
    throw new Error('Method not implemented.');
  }
}
