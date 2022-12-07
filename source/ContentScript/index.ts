import {browser} from 'webextension-polyfill-ts';

console.log('helloworld from content script');

/*

    const activeTab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];

    const {cursorPosition, inputText} = await browser.tabs.sendMessage(
      activeTab?.id ?? 0,
      {
        type: 'get-text',
      },
      {
        frameId: 0,
      }
    );

    console.log('cursorPosition', cursorPosition);
    console.log('text', inputText);

    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: inputText,
      temperature: 0.7,
      max_tokens: 500,
    });
    const {data} = response;

    console.log(response);

    const outputText = data.choices[0];

    browser.tabs.sendMessage(activeTab?.id ?? 0, {
      type: 'type-text',
      text: outputText,
    });

    */

// Implement the listener for "get-text" and "type-text" messages
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
/*
const getText = async (message: any) => {
  console.log('getText', message);
  if (message.type === 'get-text') {
    console.log('getText', message);
    const cursorPosition = await browser.tabs.executeScript({
      code: 'window.getSelection().getRangeAt(0).startOffset',
    });

    const inputText = await browser.tabs.executeScript({
      code: 'window.getSelection().getRangeAt(0).startContainer.textContent',
    });

    console.log('cursorPosition', cursorPosition);
    console.log('inputText', inputText);

    browser.runtime.sendMessage({
      type: 'get-text',
      cursorPosition: cursorPosition[0],
      inputText: inputText[0],
    });

    return {
      cursorPosition: cursorPosition[0],
      inputText: inputText[0],
    };
  }

  return null;
};
*/

// eslint-disable-next-line func-names, @typescript-eslint/explicit-function-return-type
// const highlightLastWord = () => {
//   document.dispatchEvent(
//     new KeyboardEvent('keydown', {
//       key: 'ArrowLeft',
//       keyCode: 39, // example values.
//       code: 'ArrowLeft', // put everything you need in this object.
//       which: 37,
//       location: 0,
//       shiftKey: true, // you don't need to include values
//       ctrlKey: true, // if you aren't going to use them.
//       metaKey: false, // these are here for example's sake.
//     } as any)
//   );
// };
// const hightlightAllPreviousWords = () => {
//   for (let i = 0; i < 500; i += 1) {
//     highlightLastWord();
//   }
// };
// const copyHighlightedText = (): void => {
//   document.execCommand('copy');
// };
/*
  const getClipboard = async () => {
    const text = navigator.clipboard.readText()
    console.log('clipboard:', text)
    return text
  }
  */

let focusTarget: HTMLElement | null = null;
// let inputTarget: HTMLElement | null = null;

const getTextareaText = async (): Promise<string> => {
  // await setTimeout(hightlightAllPreviousWords, 100);
  // highlightLastWord();
  // const selection = document.getSelection();
  console.log('selection', focusTarget);
  let node: HTMLElement | null = focusTarget ?? null;
  // inputTarget = node;
  let text = '';
  console.log('node', node);

  if (focusTarget !== null) {
    text = (node as any).value ?? node?.textContent ?? '';
    console.log('text', text);
    let lastText = '';
    for (let i = 0; i < 20 && (!text || text?.length < 15); i += 1) {
      node = (node?.parentNode as HTMLElement) ?? null;
      if (node !== null) {
        // inputTarget = node;
        const newText = node?.textContent ?? '';
        // If text does not have lastText in it, then append lastText to text
        text =
          newText +
          (newText && lastText && !newText.includes(lastText) ? lastText : '');
        console.log('parent text', text);
      } else {
        console.error('node is null');
        break;
      }
      lastText = text;
    }
  } else {
    console.error('selection is null');
  }

  console.log('text result:', text);

  // copyHighlightedText();
  // console.log('copied');
  /*
    const text = await getClipboard()
    console.log('get-text 5')
    return text
    */
  return text;
};

const onKeyUp = async (event: KeyboardEvent): Promise<void> => {
  const newTarget = event.target as HTMLElement;
  if (newTarget !== null) {
    if (newTarget !== focusTarget) {
      focusTarget = newTarget;
      console.log('new target', newTarget);
    } else {
      console.log('same target', newTarget);
    }
  } else {
    console.warn('new target is null', event);
  }
};

window.onkeyup = onKeyUp;

// const text = await copyPreviousText()
// eslint-disable-next-line func-names
/*
browser.runtime.sendMessage(text, function (response: unknown) {
  console.log('response:', response)
})
*/

const getTextListener = async (message: {type: string}): Promise<void> => {
  if (message.type === 'get-text') {
    console.log('getTextListener', message);
    // const text = await getText()
    // console.log('getTextListener', text)
    // send event to background script
    const text = await getTextareaText();
    browser.runtime.sendMessage({
      type: 'got-text',
      text,
    });
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
const typeText = async (message: {
  type: string;
  outputText?: string;
  clipboard?: string;
}) => {
  if (message.type === 'type-text') {
    let text = message?.outputText ?? '';
    console.log('text:', text);
    if (text === '') return;
    const clipboard = message?.clipboard ?? '';
    console.log('clipboard:', clipboard);

    // if the text starts with a 1 or 2 newlines then remove it
    text = text.replace(/^(\n|\n\n){1,2}/, '').trim();

    // if outputText starts with and/or ends with clipboard then remove it
    if (text && clipboard && text.endsWith(clipboard)) {
      text = text.slice(0, -clipboard.length);
    }
    if (text && clipboard && text.startsWith(clipboard)) {
      text = text.slice(clipboard.length);
    }

    // Paste the text into the active element, appending to the end of the text
    const activeElement: any = document.activeElement as any;
    if (activeElement !== null) {
      console.log('trying to use activeElement', activeElement);
      const value = activeElement.value ?? activeElement.textContent ?? '';
      console.log('value', value);
      const cursorPosition = activeElement.selectionStart ?? value.length;
      console.log('cursorPosition', cursorPosition);
      const newValue = value.slice(0, cursorPosition) + text; // + value.slice(cursorPosition);
      console.log('newValue', newValue);
      activeElement.value = newValue;
      activeElement.textContent = newValue;
      activeElement.selectionStart = cursorPosition + text.length;
      activeElement.selectionEnd = cursorPosition + text.length;
    } else {
      // Try typing the message one character at a time with a delay between each character to simulate typing
      // Type the text into the last focused element, "focusTarget"
      // If that element is not a text input, try to find a text input in the DOM tree above it
      // If none of that works try using inputTarget
      console.log('trying to type one character at a time');

      const typeOneCharacter = async (character: string): Promise<void> => {
        const keyEvent = new KeyboardEvent('keydown', {
          key: character,
          code: character,
          location: 0,
          repeat: false,
          isComposing: false,
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          metaKey: false,
          bubbles: true,
          cancelable: true,
        });
        console.log('keyEvent', keyEvent);
        document.dispatchEvent(keyEvent);
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      for (let i = 0; i < text.length; i += 1) {
        await typeOneCharacter(text[i]);
      }
    }

    /*
      // Start with the last focused element, "focusTarget", and work up the DOM tree, looking for an element that can be typed into
      // When found, type the text into that element
      console.log('trying to use focusTarget and work up tree:', focusTarget);
      let node: HTMLElement | null = focusTarget ?? null;
      let textNode = '';
      console.log('node', node);

      if (focusTarget !== null) {
        textNode = (node as any).value ?? node?.textContent ?? '';
        console.log('textNode', textNode);
        for (
          let i = 0;
          i < 20 && (textNode === null || textNode?.length < 3);
          i += 1
        ) {
          node = (node?.parentNode as HTMLElement) ?? null;
          if (node !== null) {
            textNode = getParentText(node as Node);
            console.log('parent text', textNode);
          } else {
            console.error('node is null');
            break;
          }
        }
      } else {
        console.error('focusTarget is null');
      }
    }
    */
  }

  return null;
};

// check if getTextListener listener is already registered
// if not, register it
if (!browser.runtime.onMessage.hasListener(getTextListener)) {
  browser.runtime.onMessage.addListener(getTextListener);
}
// typeText listener
if (!browser.runtime.onMessage.hasListener(typeText)) {
  browser.runtime.onMessage.addListener(typeText);
}

export {};
