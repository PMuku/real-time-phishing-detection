const text = document.body.innerText;
chrome.runtime.sendMessage({ type: 'PAGE_TEXT', payload: text });