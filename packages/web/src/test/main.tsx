import React, {FC, useEffect, useState} from 'react';
import * as ReactDOM from 'react-dom';

// @ts-ignore
import {DuckUser} from '../library';

const duckUser = new DuckUser({
  server: 'http://localhost:3000',
});

const App: FC = () => {
  const [mode, setMode] = useState('set');
  const [channel, setChannel] = useState('channel-1');
  const [text, setText] = useState('');

  const [data, setData] = useState<any>();

  useEffect(() => {
    if (mode === 'set') {
      setData(undefined);
      return;
    }

    async function f(): Promise<void> {
      await duckUser
        .get({
          _clipboard: undefined,
        })
        .then(setData);
    }

    void f().catch(alert);
  }, [mode]);

  return (
    <div>
      <button onClick={() => setMode(mode === 'set' ? 'get' : 'set')}>
        切换模式 （{mode}）
      </button>
      <br />
      <br />
      {mode === 'set' ? (
        <>
          <select
            value={channel}
            onChange={event => setChannel(event.target.value)}
          >
            <option value="channel-1">渠道一</option>
            <option value="channel-2">渠道二</option>
            <option value="channel-3">渠道三</option>
          </select>
          <br />
          <input
            value={text}
            onChange={event => setText(event.target.value)}
            placeholder="其他信息"
          />
          <br />
          <button
            style={{
              borderRadius: 2,
            }}
            onClick={() => {
              duckUser.set({channel, text}).then(() => alert('done'), alert);
            }}
          >
            下载/打开应用 （模拟）
          </button>
        </>
      ) : (
        <pre>{data ? JSON.stringify(data, undefined, 2) : 'loading...'}</pre>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
