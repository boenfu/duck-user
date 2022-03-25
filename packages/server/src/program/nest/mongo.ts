// eslint-disable-next-line import/no-extraneous-dependencies
import {Collection, Db, ObjectId} from 'mongodb';

import {Duck, DuckAppearance} from '../duck';

import {INest} from './nest';

export interface MongoDuck extends Duck {
  _id: ObjectId;
  touched: boolean | undefined;
}

export class MongoNest implements INest {
  private get collection(): Collection<MongoDuck> {
    return this.db.collection(this.collectionName);
  }

  constructor(private db: Db, private collectionName: string) {}

  async set(duck: Duck): Promise<void> {
    await this.collection.insertOne(duck as MongoDuck);
  }

  async get(appearance: DuckAppearance): Promise<Duck | undefined> {
    this.collection.find({
      $or: Object.entries(appearance.identifier).map(entry =>
        Object.fromEntries([entry]),
      ),
    });

    return undefined;
  }
}
