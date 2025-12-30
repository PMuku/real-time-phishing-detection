import { scoreUrl } from "../ml/logisticInference.js";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "PAGE_URL") return;

  (async () => {
    try {
      console.log("Analysing URL:", msg.payload);

      const probability = await scoreUrl(msg.payload);

      if (probability === null) {
        sendResponse({
          verdict: "UNKNOWN",
          confidence: 0
        });
        return;
      }

      let verdict;
      if (probability > 0.9) {
        verdict = "PHISHING";
      } else if (probability < 0.1) {
        verdict = "SAFE";
      } else {
        verdict = "SUSPICIOUS";
      }

      sendResponse({
        verdict,
        confidence: Number(probability.toFixed(3))
      });

    } catch (err) {
      console.error("Lexical analysis failed:", err);
      sendResponse({
        verdict: "ERROR",
        confidence: 0
      });
    }
  })();

  return true;
});
