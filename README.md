# 🛡️ AI Phishing Detector (Manifest V3 Chrome Extension)

A privacy-preserving, strictly local Chrome Extension that uses a multi-tiered Artificial Intelligence pipeline to detect phishing and social engineering attacks in real-time. 
Unlike traditional cloud-based scanners, this extension runs a fully quantized DistilBERT Transformer model directly in the browser using WebAssembly and the Chrome Offscreen API, ensuring zero user data leaves the device.

## 🧠 The 3-Tier Cascading Architecture

To balance performance with deep analysis, the extension uses a cascading pipeline:
1. **Tier 1 (Heuristics & Whitelisting):** A high-speed rule engine that instantly allows known top-tier domains and blocks obvious malicious IP patterns, saving compute resources.
2. **Tier 2 (Lexical Machine Learning):** A custom lightweight Logistic Regression model that analyzes URL structural features (hyphens, dot counts, domain math) to flag suspicious links.
3. **Tier 3 (Deep Semantic Analysis):** If Tier 2 flags a site as suspicious, an Offscreen Document is spawned. It extracts 1,500 tokens of DOM text and runs it through an 8-bit quantized DistilBERT model (via ONNX/Transformers.js) to detect manipulative, social-engineering language.

## 🛠️ Tech Stack
* **Extension API:** Chrome Manifest V3 (Service Workers, Offscreen Documents, Content Scripts)
* **Machine Learning:** ONNX Runtime Web, Transformers.js (`onnx-community/phishing-email-detection-distilbert_v2.4.1-ONNX`)
* **Build System:** Node.js, Webpack, CopyWebpackPlugin
* **Languages:** JavaScript (ES Modules), HTML/CSS

## 🚀 Local Setup & Installation

To run this extension locally or contribute to the codebase, follow these steps:

**1. Clone the repository**
```bash
git clone https://github.com/PMuku/real-time-phishing-detection.git
cd phishing-detector
```
**2. Install build dependencies**
This project uses Webpack to bundle NPM modules for the browser environment.
```bash
npm install
```
**3. Build the Extension**
Run the build script to compile the `src/` directory into the browser-ready `dist/` folder.
```bash
npm run build
```
Or use `npm run watch` for live-reloading during development

**4. Load into Chrome**
1. Open Google Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the newly generated dist folder (Do not select the root or src folder).
