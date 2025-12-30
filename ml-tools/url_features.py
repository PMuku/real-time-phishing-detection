from urllib.parse import urlparse
import re, math

def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    probs = [s.count(c) / len(s) for c in set(s)]
    return -sum(p * math.log2(p) for p in probs)


def extract_url_features(url: str) -> dict:
    parsed = urlparse(url)

    hostname = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""

    features = {}

    features["url_length"] = len(url)
    features["hostname_length"] = len(hostname)
    features["path_length"] = len(path)
    features["query_length"] = len(query)

    features["num_dots"] = url.count(".")
    features["num_hyphens"] = url.count("-")
    features["num_at"] = url.count("@")
    features["num_slashes"] = url.count("/")
    features["num_digits"] = sum(c.isdigit() for c in url)
    features["digit_ratio"] = features["num_digits"] / max(len(url), 1)

    # Suspicious patterns
    features["has_ip"] = int(bool(re.search(r"\d+\.\d+\.\d+\.\d+", hostname)))
    features["has_https"] = int(parsed.scheme == "https")

    features["hostname_entropy"] = shannon_entropy(hostname)

    return features

def featurize_urls(urls):
    return [extract_url_features(u) for u in urls]
