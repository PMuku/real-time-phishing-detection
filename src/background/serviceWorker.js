chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "PAGE_TEXT") {
    console.log("Analysing page..");

    const text = msg.payload.toLowerCase();

    let analysisResult;
    if (text.includes("bank")) {
      analysisResult = { verdict: "PHISHING" , confidence: 0.95 };
    } else {
      analysisResult = { verdict: "SAFE" , confidence: 0.99 };
    }
    sendResponse(analysisResult);
  }
});
