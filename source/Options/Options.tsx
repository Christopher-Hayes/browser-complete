import * as React from 'react';
import {browser} from 'webextension-polyfill-ts';

import './styles.scss';

const Options: React.FC = () => {
  // API key
  const [key, setKey] = React.useState('');

  // When the component mounts, load the key from extension storage
  React.useEffect(() => {
    console.log('Loading key from storage');
    browser.storage.sync.get('OPENAI_API_KEY').then((result) => {
      console.log('Loaded key from storage');
      console.log(result);
      setKey(result.OPENAI_API_KEY);
    });
  }, []);

  return (
    <div>
      <form>
        <p>
          <label htmlFor="username">OpenAI GPT-3 Key</label>
          <br />
          <input
            type="text"
            id="key"
            name="key"
            spellCheck="false"
            autoComplete="off"
            required
            value={key}
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            onChange={(e) => {
              console.log('set:', e.target.value);
              setKey(e.target.value);
              browser.storage.sync.set({OPENAI_API_KEY: e.target.value});
            }}
          />
        </p>
      </form>
    </div>
  );
};

export default Options;
