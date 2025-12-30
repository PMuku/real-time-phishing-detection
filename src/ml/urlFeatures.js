
export function shannonEntropy(str) {
  if (!str || str.length === 0) return 0;
  const freq = {};
  for (const c of str) freq[c] = (freq[c] || 0) + 1;
  const len = str.length;
  let entropy = 0;
  for (const c in freq) {
    const p = freq[c] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function extractUrlFeatures(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const hostname = parsed.hostname || "";
  const query = parsed.search ? parsed.search.slice(1) : "";

  return {
    url_length: url.length,
    hostname_length: hostname.length,
    query_length: query.length,

    num_dots: (url.match(/\./g) || []).length,
    num_hyphens: (url.match(/-/g) || []).length,
    num_at: (url.match(/@/g) || []).length,
    num_slashes: (url.match(/\//g) || []).length,
    num_digits: (url.match(/\d/g) || []).length,
    digit_ratio: url.length ? (url.match(/\d/g) || []).length / url.length : 0,

    has_ip: /\d+\.\d+\.\d+\.\d+/.test(hostname) ? 1 : 0,
    has_https: parsed.protocol === "https:" ? 1 : 0,
    hostname_entropy: shannonEntropy(hostname)
  };
}

