import {MongoClient} from 'mongodb';

import {DuckUserServer, MongoNest} from '../../bld/library';

(async () => {
  let client = await MongoClient.connect('mongodb://localhost:27017', {
    ignoreUndefined: true,
  });

  let db = client.db('duck-user');

  new DuckUserServer({
    nest: new MongoNest(db, 'ducks'),
  }).start();
})().catch(console.error);
