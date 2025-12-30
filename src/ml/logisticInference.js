import { extractUrlFeatures } from "./urlFeatures.js";

let modelCache = null;

async function loadModel() {
  if (modelCache) return modelCache;

  const modelUrl = chrome.runtime.getURL("ml/lexical_model.json");
  const response = await fetch(modelUrl);

  if (!response.ok) {
    throw new Error("Failed to load lexical_model.json");
  }

  modelCache = await response.json();
  return modelCache;
}

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

export async function scoreUrl(url) {
  const model = await loadModel();
  const features = extractUrlFeatures(url);
  if (!features) return null;

  let z = model.bias;

  model.features.forEach((name, i) => {
    const x = features[name];
    const standardized = (x - model.scaler.mean[i]) / model.scaler.scale[i];
    z += standardized * model.weights[i];
  });

  return sigmoid(z);
}