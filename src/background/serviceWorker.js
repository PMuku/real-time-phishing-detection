import { scoreUrl } from "../ml/logisticInference.js";
import { runHeuristicRules } from "./ruleEngine.js";

const ML_THRESHOLDS = {
  PHISHING: 0.9,
  SAFE: 0.1,
  DEEP: 0.7
};

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.WORKERS],
    justification: 'Running transformer'
  });
}

async function deepInference(text) {
  try {
    await ensureOffscreen();

    return await new Promise((resolve) => {
      const timer = setTimeout(() => {
        console.warn("transformer timed out");
        resolve(null);
      }, 25000); //25s
    
      chrome.runtime.sendMessage(
        { type: 'DEEP_INFERENCE', text: text }, (response) => {
          clearTimeout(timer);

          if (chrome.runtime.lastError) {
            console.error("Error in deep inference message:", chrome.runtime.lastError);
            resolve(null);
            return;
          }

          if (!response || !response.success) {
            console.error("Deep inference failed:", response ? response.error : "No response");
            resolve(null);
            return;
          }

          resolve(response);
        });
      });
    } catch (err) {
      console.error("Error ensuring offscreen document:", err);
      return null;
    }
}

async function analyzeContent(payload) {
  const { url, title, textSnippet, hasPwdField } = payload;
  console.log("Analysing URL:", url);

  // 1. rule engine
  const ruleRes = runHeuristicRules(url, title, hasPwdField);
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

  const t2confidence = Number(probability.toFixed(3));
  if (probability >= ML_THRESHOLDS.PHISHING) {
    return {
      verdict: "PHISHING", confidence: t2confidence,
      reason: "High phishing probability from ML model"
    };
  } else if (probability <= ML_THRESHOLDS.SAFE) {
    return {
      verdict: "SAFE", confidence: t2confidence,
      reason: "Low phishing probability from ML model"
    };
  }
  
  // else SUSPICIOUS
  console.log("ML model is uncertain, passing to deep inference...");
  if (!textSnippet || textSnippet.trim().length < 20) {
    return {
      verdict: "SUSPICIOUS", confidence: t2confidence, reason: "Insufficient text for deep analysis"
    }
  }

  const t3result = await deepInference(textSnippet);
  if (!t3result) {
    return {
      verdict: "SUSPICIOUS", confidence: t2confidence, reason: "Deep inference failed or timed out, relying on ML result"
    };
  }

  // handle deep inference result from offscreen listener
  
  if (t3result.label === "NEGATIVE" && t3result.score >= ML_THRESHOLDS.DEEP) {
    const mixed = Number((t2confidence + t3result.score) / 2).toFixed(3);
    return {
      verdict: "PHISHING", confidence: mixed,
      reason: "Deep inference indicates negative sentiment with high confidence"
    };
  }
  return {
    verdict: "SAFE", confidence: Number((t2confidence * (1 - t3result.score)).toFixed(3)),
    reason: "Deep inference does not indicate strong phishing signals"
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
