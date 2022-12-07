/* eslint-disable @typescript-eslint/explicit-function-return-type */
// disable all eslint rules for this file
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import 'emoji-log';
import {browser} from 'webextension-polyfill-ts';
import {Configuration, OpenAIApi} from 'openai';

let OPENAI_API_KEY = '';

let configuration: Configuration;

/*
function setupDetails(action: any, id: any) {
  // Wrap the async function in an await and a runtime.sendMessage with the result
  // This should always call runtime.sendMessage, even if an error is thrown
  const wrapAsyncSendMessage = (act: any) =>
    `(async function () {
    const result = { asyncFuncID: '${id}' };
    try {
        result.content = await (${act})();
    }
    catch(x) {
        // Make an explicit copy of the Error properties
        result.error = { 
            message: x.message, 
            arguments: x.arguments, 
            type: x.type, 
            name: x.name, 
            stack: x.stack 
        };
    }
    finally {
        // Always call sendMessage, as without it this might loop forever
        chrome.runtime.sendMessage(result);
    }
})()`;

  // Apply this wrapper to the code passed
  let execArgs = {code: ''};
  if (typeof action === 'function' || typeof action === 'string')
    // Passed a function or string, wrap it directly
    execArgs.code = wrapAsyncSendMessage(action);
  else if (action.code) {
    // Passed details object https://developer.chrome.com/extensions/tabs#method-executeScript
    execArgs = action;
    execArgs.code = wrapAsyncSendMessage(action.code);
  } else if (action.file)
    throw new Error(
      `Cannot execute ${action.file}. File based execute scripts are not supported.`
    );
  else
    throw new Error(
      `Cannot execute ${JSON.stringify(
        action
      )}, it must be a function, string, or have a code property.`
    );

  return execArgs;
}

function promisifyRuntimeMessage(id: string) {
  // We don't have a reject because the finally in the script wrapper should ensure this always gets called.
  return new Promise((resolve) => {
    const listener: any = (request: any) => {
      // Check that the message sent is intended for this listener
      if (request && request?.asyncFuncID === id) {
        // Remove this listener
        browser.runtime.onMessage.removeListener(listener);
        resolve(request);
      }

      // Return false as we don't want to keep this channel open https://developer.chrome.com/extensions/runtime#event-onMessage
      return false;
    };

    browser.runtime.onMessage.addListener(listener);
  });
}

// eslint-disable-next-line func-names
(browser.tabs as any).executeAsyncFunction = async function (
  tab: any,
  action: any
) {
  // Generate a random 4-char key to avoid clashes if called multiple times
  const id = Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);

  const details = setupDetails(action, id);
  const message = promisifyRuntimeMessage(id);

  // This will return a serialised promise, which will be broken
  await browser.tabs.executeScript(tab, details);

  // Wait until we have the result message
  const {content, error} = (await message) as {
    content: any;
    error: any;
  };

  if (error)
    throw new Error(`Error thrown in execution script: ${error.message}.
Stack: ${error.stack}`);

  return content;
};
*/

browser.runtime.onInstalled.addListener(async () => {
  console.emoji('🦄', 'extension installed');

  OPENAI_API_KEY = (await browser.storage.sync.get('OPENAI_API_KEY'))
    .OPENAI_API_KEY;

  configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
});

browser.commands.onCommand.addListener(async (command) => {
  if (command === 'run-browser-complete') {
    console.log('run-browser-complete');

    // Check if the API key has changed
    if (
      OPENAI_API_KEY !==
      (await browser.storage.sync.get('OPENAI_API_KEY')).OPENAI_API_KEY
    ) {
      OPENAI_API_KEY = (await browser.storage.sync.get('OPENAI_API_KEY'))
        .OPENAI_API_KEY;

      configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
      });
    }
    console.log('configuration', configuration);

    /*
    // Find the cursor position and get the text before it, up to 500 characters

    browser.tabs.sendMessage(
      activeTab?.id ?? 0,
      {
        type: 'get-text',
      },
      {
        frameId: 0,
      }
    );

    // Listen for the response from the content script
    browser.runtime.onMessage.addListener((message) => {
      console.log('message', message);
      if (message.type === 'get-text') {

    });
    */

    // const cursorPosition = await browser.tabs.executeScript(activeTab?.id ?? 0, {
    //   code: 'window.getSelection().getRangeAt(0).startOffset',
    // })

    /*
    const inputText: string = await (browser.tabs as any).executeAsyncFunction(
      activeTab?.id ?? 0,
    );

    // const inputText: string = (await message) as string;

    // console.log('cursorPosition', cursorPosition)
    console.log('inputText', inputText);

    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: inputText,
      temperature: 0.7,
      max_tokens: 500,
    });
    const {data} = response;

    console.log(response);

    const outputText = data.choices[0].text;

    browser.tabs.sendMessage(activeTab?.id ?? 0, {
      type: 'type-text',
      text: outputText,
    });
    */

    const activeTab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];

    browser.tabs.sendMessage(activeTab?.id ?? 0, {
      type: 'get-text',
    });

    /*
    await browser.tabs.executeScript(
      activeTab?.id ?? 0,
      {
        // `window.getSelection().getRangeAt(0).startContainer.textContent`,
        code: `
(async () => {
const highlightLastWord = () => {
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      keyCode: 39, // example values.
      code: "ArrowLeft", // put everything you need in this object.
      which: 37,
      location: 0,
      shiftKey: true, // you don't need to include values
      ctrlKey: true,  // if you aren't going to use them.
      metaKey: false   // these are here for example's sake.
    })
  );
}
const hightlightAllPreviousWords = () => {
  for (let i = 0; i < 500; i++) {
    highlightLastWord();
  }
}
const copyHighlightedText = () => {
  document.execCommand('copy');
}
const getClipboard = async () => {
  const text = navigator.clipboard.readText()
  console.log('clipboard:', text);
  return text;
}
const copyPreviousText = async () => {
  await setTimeout(hightlightAllPreviousWords, 100)
  copyHighlightedText();
  const text = await getClipboard();
  return text;
}
const inputText = await copyPreviousText();
chrome.runtime.sendMessage(inputText, function (response) {
  console.log('response:', response);
});
})()`,
      },
      async () => {
        // Create a promise that resolves when chrome.runtime.onMessage fires
        const message = new Promise((resolve) => {
          const listener = (request: unknown) => {
            browser.runtime.onMessage.removeListener(listener);
            resolve(request);
          };
          browser.runtime.onMessage.addListener(listener);
        });

        const inputText: string = (await message) as string;

        // console.log('cursorPosition', cursorPosition)
        console.log('inputText', inputText);

        const openai = new OpenAIApi(configuration);
        const response = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: inputText,
          temperature: 0.7,
          max_tokens: 500,
        });
        const {data} = response;

        console.log(response);

        const outputText = data.choices[0].text;

        browser.tabs.sendMessage(activeTab?.id ?? 0, {
          type: 'type-text',
          text: outputText,
        });
      }
    );
  */
  }
});

let lastEventTrigger = 0;
// wait for an event to be fired from the content script for "get-text"
browser.runtime.onMessage.addListener(async (message) => {
  console.log('message', message);
  if (message.type === 'got-text' && lastEventTrigger < Date.now() - 2000) {
    console.log('got-text');

    // const clipboard = await navigator.clipboard.readText();
    let textareaText = message.text;
    console.log('clipboard', textareaText);

    // Reject text that is too short
    if (!textareaText || textareaText.length < 10) {
      console.error('clipboard too short');
      return;
    }

    if (textareaText.length > 500) {
      // get the last 500 characters
      textareaText = textareaText.slice(-500);
      console.log('truncated clipboard', textareaText);
    }

    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: textareaText,
      temperature: 0.7,
      max_tokens: 300,
    });
    const {data} = response;

    console.log(response);

    const outputText = data.choices[0].text;

    const activeTab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];

    browser.tabs.sendMessage(activeTab?.id ?? 0, {
      type: 'type-text',
      outputText,
      clipboard: textareaText,
    });

    lastEventTrigger = Date.now();
  }
});
