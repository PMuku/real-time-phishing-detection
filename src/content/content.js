const text = document.body.innerText;
const pageTitle = document.title;

const payload = {
    url: window.location.href,
    title: pageTitle,
    textSnippet: (text || '').substring(0, 1500).replace(/\s+/g, ' ').trim(),
    hasPwdField: !!document.querySelector('input[type="password"]')
};

chrome.runtime.sendMessage({ type: 'PAGE_URL', payload: payload }, (response) => {
    
    if (!response) {
        console.warn("No response from background script.");
        return;
    }

    if (response.verdict === 'PHISHING') {
        console.warn('Phishing page detected. Neutralising content. Risk proba :', response.confidence);
        neutralisePage();
    } else if (response.verdict === 'SUSPICIOUS') {
        console.warn('Page is suspicious. Risk proba :', response.confidence);
        showSusBanner(response);
    } else {
        console.log('Page is safe. Risk proba:', response.confidence);
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

function showSusBanner(response = {}) {
    if (document.getElementById('sus-banner')) return; // already there

    const { confidence = 0, reason = '' } = response;

    const banner = document.createElement('div');
    banner.id = 'sus-banner';
    banner.style.position = 'fixed';
    banner.style.top = '0';
    banner.style.left = '0';
    banner.style.width = '100%';
    banner.style.zIndex = '2147483647';
    banner.style.backgroundColor = '#ffcc00';
    banner.style.color = '#222';
    banner.style.padding = '10px 14px';
    banner.style.display = 'flex';
    banner.style.textAlign = 'center';
    banner.style.alignItems = 'center';
    banner.style.gap = '12px';
    banner.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
    banner.style.fontFamily = 'sans-serif';
    banner.style.fontSize = '16px';
    
    const message = document.createElement('div');
    message.style.flex = '1';
    const pct = Math.round((Number(confidence) || 0) * 1000) / 10;
    message.innerText = `This page looks suspicious (${pct}% risk). ${reason || ''}`.trim();

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';

    const detailsBtn = document.createElement('button');
    detailsBtn.innerText = 'Details';
    detailsBtn.style.background = 'transparent';
    detailsBtn.style.border = '1px solid #e0b85a';
    detailsBtn.style.padding = '6px 10px';
    detailsBtn.style.cursor = 'pointer';
    detailsBtn.style.borderRadius = '4px';
    detailsBtn.onclick = () => {
        alert(`Risk: ${pct}%\nReason: ${reason || 'No further reason available.'}`);
    };

    const dismiss = document.createElement('button');
    dismiss.innerText = 'Dismiss';
    dismiss.style.background = '#ffd27a';
    dismiss.style.border = 'none';
    dismiss.style.padding = '6px 10px';
    dismiss.style.cursor = 'pointer';
    dismiss.style.borderRadius = '4px';
    dismiss.onclick = () => {
        banner.remove();
        restoreBodyOffset();
    };

    actions.appendChild(detailsBtn);
    actions.appendChild(dismiss);

    banner.appendChild(message);
    banner.appendChild(actions);

    // insert banner and push page content down
    document.documentElement.appendChild(banner);
    // set margin after render to avoid layout jumps
    requestAnimationFrame(() => {
        const h = banner.getBoundingClientRect().height;
        document.body.style.marginTop = `${h}px`;
    });

    // cleanup helper
    function restoreBodyOffset() {
        document.body.style.marginTop = '';
    }

    // expose helper for manual testing if needed
    window.__showSusBanner = showSusBanner;
}