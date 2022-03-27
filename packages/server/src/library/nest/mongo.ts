// eslint-disable-next-line import/no-extraneous-dependencies
import {Collection, Db, ObjectId} from 'mongodb';

import {Duck, DuckAppearance} from '../duck';

import {compareKinds, strictCompareKinds} from './@utils';
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
    for await (let _duck of this.collection
      .find({
        $and: [
          {
            diedAt: {
              $gt: Date.now(),
            },
          },
          {
            $or: Object.entries(appearance.identifier).map(entry => {
              entry[0] = `identifier.${entry[0]}`;
              return Object.fromEntries([entry]);
            }),
          },
        ],
      })
      .sort({_id: -1})) {
      if (_duck.touched) {
        if (strictCompareKinds(_duck, appearance)) {
          return _duck;
        }
      } else if (compareKinds(_duck, appearance)) {
        await this.collection.updateOne(_duck, {$set: {touched: true}});
        return _duck;
      }
    }

    return undefined;
  }
}
