const text = document.body.innerText;
chrome.runtime.sendMessage({ type: 'PAGE_TEXT', payload: text }, (response) => {
    if (response && response.verdict === 'PHISHING') {
        console.warn('Phishing page detected. Neutralising content.');
        neutralisePage();
    } else {
        console.log('Page is safe.');
    }
});

function neutralisePage() {
    document.body.style.border = '5px solid red';
    document.body.style.backgroundColor = '#ffe6e6';

    const overlay = document.createElement('div');
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw"; 
    overlay.style.height = "100vh"; 
    overlay.style.backgroundColor = "rgba(255, 0, 0, 0.4)"; 
    overlay.style.zIndex = "2147483647";
    overlay.style.cursor = "not-allowed";
    overlay.style.backdropFilter = "blur(5px)";

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden'; // Disable scrolling    
}  