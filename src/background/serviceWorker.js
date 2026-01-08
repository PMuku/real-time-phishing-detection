import { scoreUrl } from "../ml/logisticInference.js";
import { runHeuristicRules } from "./ruleEngine.js";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "PAGE_URL") return;

  (async () => {
    try {
      const { url, title } = msg.payload;
      console.log("Analysing URL:", msg.payload);

      const ruleRes = runHeuristicRules(url, title);
      if (ruleRes.action === "BLOCK") {
        console.warn(`Blocked by Rules: ${ruleRes.reason}`);
        sendResponse({
          verdict: "PHISHING",
          confidence: 1.0,
          reason: ruleRes.reason
        });
        return;
      }
      if (ruleRes.action === "ALLOW") {
        console.log(`Allowed by Rules: ${ruleRes.reason}`);
        sendResponse({
          verdict: "SAFE",
          confidence: 0,
          reason: ruleRes.reason
        });
        return;
      }
      
      console.log("Passing to ML tier...");
      const probability = await scoreUrl(url);

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
