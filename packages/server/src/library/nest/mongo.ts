// eslint-disable-next-line import/no-extraneous-dependencies
import {Collection, Db, Filter, ObjectId} from 'mongodb';

import {Duck, DuckAppearance} from '../duck';

import {compareKinds} from './@utils';
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
    let diedQuery: Filter<MongoDuck> = {
      diedAt: {
        $gt: Date.now(),
      },
    };

    let sorter = {
      $sort: {
        _id: -1,
        touched: 1,
      },
    };

    let {allMatched, matched} = (await this.collection
      .aggregate<{
        allMatched: MongoDuck[];
        matched: MongoDuck[];
      }>([
        {
          $facet: {
            ...(Object.keys(appearance.identifier).length > 1
              ? {
                  allMatched: [
                    {
                      $match: {
                        ...diedQuery,
                        identifier: appearance.identifier,
                      },
                    },
                    sorter,
                  ],
                }
              : {}),
            matched: [
              {
                $match: {
                  $and: [
                    diedQuery,
                    {
                      $or: Object.entries(appearance.identifier).map(entry => {
                        entry[0] = `identifier.${entry[0]}`;
                        return Object.fromEntries([entry]);
                      }),
                    },
                  ],
                },
              },
              sorter,
            ],
          },
        },
      ])
      .next())!;

    let targetDuck: Duck | undefined;

    if (allMatched?.length) {
      if (compareKinds(allMatched[0], appearance)) {
        targetDuck = allMatched[0];
      }
    } else if (matched?.length) {
      let {duck, score} = matched
        .map((_duck, index, arr) => {
          let base = arr.length - index;

          if (
            !compareKinds(_duck, appearance, mks => {
              base = Math.max(base - mks.length, 0);
              return true;
            })
          ) {
            return {
              duck: _duck,
              score: -1,
            };
          }

          if (_duck.touched) {
            base *= 0.1;
          }

          return {
            duck: _duck,
            score: base,
          };
        })
        .sort((a, b) => b.score - a.score)[0];

      if (score >= 0) {
        targetDuck = duck;
      }
    }

    if (targetDuck) {
      await this.collection.updateOne(targetDuck, {
        $set: {
          touched: true,
        },
      });
    }

    return targetDuck;
  }
}
