import { env, pipeline } from '@xenova/transformers';

const MODEL_NAME = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';

// dont allow local models, only load from Hugging face, and cache in IndexedDB
env.allowLocalModels = false; 

let classifierInstance = null;

async function getClassifier() {
    if (classifierInstance) return classifierInstance;

    classifierInstance = await pipeline('text-classification', MODEL_NAME,
        { quantized: true }
    );
    console.log('Model loaded, future loads from cache');
    
    return classifierInstance;
}

// listen for deep inference requests from background script
chrome.runtime.onMessage.addListener(
    (msg, sender, sendResponse) => {
        if (msg.type !== "DEEP_INFERENCE") return false;

        (async () => {
            try {
                const classifier = await getClassifier();

                const [{ label, score }] = await classifier(msg.text);
                console.log('Deep inference result:', { label, score });

                sendResponse({ success: true, label, score });
            } catch (err) {
                console.error('Error during deep inference:', err);
                sendResponse({ success: false, error: err.message });
            }
        })();

        return true;
    }
);

getClassifier().catch(err => console.error('Error loading model:', err));
