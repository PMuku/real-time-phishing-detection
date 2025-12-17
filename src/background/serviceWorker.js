chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "PAGE_TEXT") {
    console.log("Received page text:", msg.payload.slice(0, 200));
  }
});
