
// whitelisted domains to be skipped
const WHITELIST_DOMAINS = [
    "google.com", "www.google.com",
    "facebook.com", "www.facebook.com",
    "twitter.com", "x.com",
    "linkedin.com", "www.linkedin.com",
    "github.com", "www.github.com",
    "wikipedia.org", "www.wikipedia.org",
    "amazon.com", "www.amazon.com",
    "paypal.com", "www.paypal.com",
    "microsoft.com", "www.microsoft.com"
];

// brands for domain mismatch checks
const PROTECTED_BRANDS = {
    "paypal": "paypal.com",
    "google": "google.com",
    "microsoft": "microsoft.com",
    "apple": "apple.com",
    "amazon": "amazon.com",
    "chase": "chase.com",
    "facebook": "facebook.com",
    "netflix": "netflix.com",
    "instagram": "instagram.com"
};

export function runHeuristicRules(url, pageTitle = "") {
    let parsed;
    try {
        parsed = new URL(url);
    } catch (e) {
        return { action: "BLOCK", reason: "Invalid URL format" };
    }

    const hostname = parsed.hostname.toLowerCase();
    const cleanTitle = pageTitle ? pageTitle.toLowerCase() : "";

    // whitelist check
    if (WHITELIST_DOMAINS.includes(hostname) || hostname.endsWith(".gov")) {
        return { action: "ALLOW", reason: "Whitelisted Domain" };
    }

    // block raw IPs
    // regex for standard Public IPs
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        return { action: "BLOCK", reason: "Raw IP Address detected" };
    }

    // "@" redirection attack
    if (url.includes("@")) {
        return { action: "BLOCK", reason: "Malicious '@' Redirection" };
    }

    // login over insecure HTTP.
    if (parsed.protocol === "http:") {
        const loginKeywords = ["login", "signin", "bank", "secure", "account", "verify"];
        const hasKeyword = loginKeywords.some(kw => url.includes(kw) || cleanTitle.includes(kw));
        
        if (hasKeyword) {
            return { action: "BLOCK", reason: "Insecure (HTTP) Login Page" };
        }
    }

    // domain mismatch
    if (cleanTitle) {
        for (const [brand, officialDomain] of Object.entries(PROTECTED_BRANDS)) {
            if (cleanTitle.includes(brand) && !hostname.includes(officialDomain)) {
                 return { 
                    action: "BLOCK", 
                    reason: `Domain Mismatch: Page claims to be ${brand} but URL is ${hostname}` 
                };
            }
        }
    }

    return { action: "NEXT_TIER", reason: "No heuristic violations" };
}