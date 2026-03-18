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
// chrome.runtime.onMessage.addListener

getClassifier().catch(err => console.error('Error loading model:', err));
