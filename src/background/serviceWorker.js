import { scoreUrl } from "../ml/logisticInference.js";
import { runHeuristicRules } from "./ruleEngine.js";

const ML_THRESHOLDS = {
  PHISHING: 0.9,
  SAFE: 0.1
};

async function analyzeContent(payload) {
  const { url, title } = payload;
  console.log("Analysing URL:", payload);

  // 1. rule engine
  const ruleRes = runHeuristicRules(url, title);
  if (ruleRes.action === "BLOCK") {
    console.warn(`Blocked by Rules: ${ruleRes.reason}`);
    return {
      verdict: "PHISHING", confidence: 1.0, reason: ruleRes.reason
    };
  }
  
  if (ruleRes.action === "ALLOW") {
    console.log(`Allowed by Rules: ${ruleRes.reason}`);
    return {
      verdict: "SAFE", confidence: 0, reason: ruleRes.reason
    };
  }
  
  // 2. ML inference
  console.log("Passing to ML tier...");
  const probability = await scoreUrl(url);

  if (probability === null) {
    return{
      verdict: "UNKNOWN", confidence: 0, reason: "Lexical feature extraction failed"
    };
  }

  let verdict, reason;
  const confidence = Number(probability.toFixed(3));
  if (probability >= ML_THRESHOLDS.PHISHING) {
    verdict = "PHISHING";
    reason = "High phishing probability from ML model";
  } else if (probability <= ML_THRESHOLDS.SAFE) {
    verdict = "SAFE";
    reason = "Low phishing probability from ML model";
  } else {
    verdict = "SUSPICIOUS";
    reason = "Ambiguous probability; requires further analysis";
  }

  return {
    verdict: verdict, confidence: confidence, reason: reason
  };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "PAGE_URL" || !msg.payload) return false;

  analyzeContent(msg.payload).then(result => {
    console.log("Analysis Result:", result);
    sendResponse(result);
  }).catch(err => {
    console.error("Error during analysis:", err);
    sendResponse({
      verdict: "ERROR", confidence: 0, reason: "Exception during analysis"
    });
  });

  return true;
});
