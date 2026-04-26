import feedparser
import os
import json
import datetime
import trafilatura
import time
import re
import urllib.request
import requests as req_lib
from urllib.parse import urlparse
from openai import OpenAI

SIGNALS_FILE = "_data/signals.yml"

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

FEEDS = [
    "crossref:2949-7191",  # Natural Language Processing Journal (ScienceDirect blocks datacenter IPs)
    "https://www.annualreviews.org/rss/content/journals/linguistics/latestarticles?fmt=rss",
    "https://www.cambridge.org/core/rss/product/id/CB4469A0E10303A62565A388519063AA",
    "https://www.mdpi.com/rss/journal/languages",
    "https://onlinelibrary.wiley.com/feed/14679841/most-recent",
    "https://www.glossa-journal.org/rss/",
    "https://translation.ec.europa.eu/node/27/rss_en",
    "https://www.nimdzi.com/feed/",
    "https://slator.com/feed/",
    "https://techcrunch.com/tag/translation/feed/",
    "https://techcrunch.com/tag/ai-translation/feed/",
    "https://techcrunch.com/tag/machine-translation/feed/",
    "https://techcrunch.com/tag/localization/feed/",
    "https://techcrunch.com/tag/translate/feed/",
    "https://techcrunch.com/tag/translations/feed/",
    "https://www.atanet.org/news/industry-news/feed/",
    "https://elia-association.org/news/feed/",
    "https://www.language-industry.ca/news?format=rss",
    "https://news.google.com/rss/search?q=(translation OR localization OR \"language AI\" OR multilingual OR \"AI translation\") (acquisition OR acquired OR acquires OR merger) -DNA -RNA -mRNA -protein -ribosome -gene -genetic -genome -biological -cell -cells -enzyme -biosynthesis -CRISPR when:90d&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=(localization OR translation OR multilingual OR \"language AI\" OR \"AI translation\") (platform OR software OR SaaS OR tool) -DNA -RNA -mRNA -protein -ribosome -gene -genetic -genome -biological -cell -cells -enzyme -biosynthesis -CRISPR when:90d&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=(translation OR localization OR multilingual OR \"AI translation\" OR \"language AI\") (startup OR \"early stage\" OR venture OR funding OR raises) -DNA -RNA -mRNA -protein -ribosome -gene -genetic -genome -biological -cell -cells -enzyme -biosynthesis -CRISPR when:90d&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=(translation OR localization OR multilingual OR \"language AI\" OR \"AI translation\") (industry OR services OR company OR provider OR platform) -DNA -RNA -mRNA -protein -ribosome -gene -genetic -genome -biological -cell -cells -enzyme -biosynthesis -CRISPR when:90d&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=\"RWS+Group\"+(translation+OR+localization+OR+\"language+services\")&hl=en-US&gl=US&ceid=US:en",
    "https://aparasion.github.io/rss-generator/rss/GALA-Global.xml",
    "https://aparasion.github.io/rss-generator/rss/PRNewswire-L10N.xml",
    "https://aparasion.github.io/rss-generator/rss/XTM-Blog.xml",
    "https://xtm.ai/blog/rss.xml",
    "https://aparasion.github.io/rss-generator/rss/phrase-blog.xml",
    "https://aparasion.github.io/rss-generator/rss/lokalise-blog.xml",
    "https://aparasion.github.io/rss-generator/rss/crowdin-blog.xml",
    "https://www.deepl.com/en/blog/rss.xml",
    "https://aparasion.github.io/rss-generator/rss/transperfect-news-and-press.xml",
    "https://www.languageline.com/blog/rss.xml",
    "https://www.smartling.com/company-news/rss.xml",
    "https://en-gb.thebigword.com/news-and-blogs/feed/",
    "https://www.vistatec.com/news-blog/feed/",
    "https://www.cqfluency.com/who-we-are/news/feed/",
    "https://sorenson.com/company/blog/feed/",
    "https://propio.com/blogs/feed/",
    "https://www.publicisgroupeuk.com/news-and-views/feed",
    "https://www.helloglobo.com/blog-old/rss.xml",
    "https://datawords.com/our-news/feed/",
    "https://www.cqfluency.com/cqpedia-cultural-intelligence-encyclopedia/feed/",
    "https://www.ecinnovations.com/blog/feed/",
    "https://imminent.translated.com/feed",
    "https://effectiff.com/blog-1/f.rss",
    "https://aparasion.github.io/rss-generator/rss/CSA-blog.xml",
    "https://aparasion.github.io/rss-generator/rss/OpenAI-News-L10N.xml",
    "https://inten.to/blog/feed/",
    "https://propio.com/blogs/feed/",
    "https://www.helloglobo.com/blog/rss.xml",
]

SEEN_FILE = "seen.json"
SEEN_HISTORY_CAP = 5000
YOUR_AREA = "Translation"

# ── Theory vs Industry classification ──
THEORY_SOURCES = {
    "annualreviews.org",
    "sciencedirect.com",
    "cambridge.org",
    "glossa-journal.org",
    "mdpi.com",
    "wiley.com",
    "dx.doi.org",
    "doi.org",
}

# Sources whose RSS excerpts are too short to pass is_usable_article_text but
# whose feed descriptions are reliable enough to use as gist input directly.
LENIENT_SOURCES = {
    "multilingual.com",
}

THEORY_CONTENT_KEYWORDS = [
    "abstract", "methodology", "corpus analysis", "morphosyntax",
    "psycholinguistics", "sociolinguistics", "phonology", "syntax",
    "pragmatics", "computational linguistics", "peer-reviewed",
    "linguistic typology", "language acquisition", "discourse analysis",
    "semantics", "morphology", "phonetics", "prosody", "lexicon",
    "diachronic", "synchronic", "generative grammar", "cognitive linguistics",
]


def classify_article_type(publisher: str, text: str) -> str:
    """Classify an article as 'theory' (linguistic/communication science) or 'industry'."""
    # Primary: source-based classification
    if any(ts in publisher.lower() for ts in THEORY_SOURCES):
        return "theory"
    # Fallback: content-based keyword heuristic
    sample = text[:3000].lower()
    hits = sum(1 for kw in THEORY_CONTENT_KEYWORDS if kw in sample)
    if hits >= 3:
        return "theory"
    return "industry"
MAX_ARTICLES = 18
MIN_ARTICLE_CHARS = 500
MIN_ARTICLE_WORDS = 90

BOILERPLATE_PATTERNS = [
    r"\bcookies?\b",
    r"\bprivacy policy\b",
    r"\baccept (all )?cookies\b",
    r"\bmanage (your )?(consent|preferences)\b",
    r"\bconsent\b",
    r"\bdata protection\b",
]


def yaml_escape(text: str) -> str:
    """Escape content for safe inclusion in quoted YAML scalar values."""
    return text.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").strip()


def get_publisher_domain(url: str) -> str:
    """Extract clean domain name from URL (e.g. 'distractify.com')"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        # Remove common prefixes
        if domain.startswith(('www.', 'amp.', 'm.')):
            domain = domain.split('.', 1)[1] if '.' in domain[4:] else domain[4:]
        # Remove port if present (rare)
        domain = domain.split(':', 1)[0]
        return domain if domain else "Unknown Publisher"
    except Exception:
        return "Unknown Publisher"


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def normalize_url(url: str) -> str:
    """Normalize a URL for deduplication: strip fragment and trailing slash."""
    cleaned = (url or "").strip()
    if not cleaned:
        return ""
    return cleaned.split("#", 1)[0].rstrip("/")


def normalize_title(title: str) -> str:
    """Normalize an article title for deduplication: lowercase, collapse whitespace, strip punctuation."""
    lowered = (title or "").lower()
    stripped = re.sub(r"[^a-z0-9\s]", "", lowered)
    return re.sub(r"\s+", " ", stripped).strip()


def load_existing_post_dedup_index(posts_dir: str = "_posts") -> tuple[set[str], set[str]]:
    """Load normalized source URLs and titles from existing post front matter."""
    existing_urls: set[str] = set()
    existing_titles: set[str] = set()

    if not os.path.isdir(posts_dir):
        return existing_urls, existing_titles

    source_re = re.compile(r'^source_url:\s*"?(.+?)"?\s*$')
    title_re = re.compile(r'^title:\s*"?(.+?)"?\s*$')

    for name in os.listdir(posts_dir):
        if not name.endswith(".md"):
            continue
        path = os.path.join(posts_dir, name)
        try:
            with open(path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            if not lines or lines[0].strip() != "---":
                continue

            front_matter = []
            for line in lines[1:]:
                if line.strip() == "---":
                    break
                front_matter.append(line.strip())

            for line in front_matter:
                source_match = source_re.match(line)
                if source_match:
                    normalized = normalize_url(source_match.group(1).strip())
                    if normalized:
                        existing_urls.add(normalized)
                    continue
                title_match = title_re.match(line)
                if title_match:
                    normalized_title = normalize_title(title_match.group(1).strip())
                    if normalized_title:
                        existing_titles.add(normalized_title)
        except Exception as e:
            print(f"Warning: failed to read post {path}: {e}")

    return existing_urls, existing_titles


def strip_html(text: str) -> str:
    """Remove HTML tags and decode common HTML entities."""
    text = re.sub(r"<[^>]+>", " ", text or "")
    return text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")


def fetch_feed(url: str) -> feedparser.FeedParserDict:
    """Fetch a feed URL with a browser-like User-Agent and parse with feedparser.

    Using urllib to pre-fetch allows sites that block feedparser's default
    User-Agent (e.g. returning 403) to be reached normally.
    Falls back to requests with full browser headers for stricter sites (e.g. ScienceDirect).
    """
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; newsreader/1.0)"},
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
        return feedparser.parse(content)
    except Exception:
        pass

    # Fallback: full browser headers via requests (handles stricter host checks)
    try:
        resp = req_lib.get(url, headers=_BROWSER_HEADERS, timeout=15, allow_redirects=True)
        if resp.ok:
            return feedparser.parse(resp.content)
        print(f"Failed to fetch feed {url}: HTTP {resp.status_code}")
    except Exception as e:
        print(f"Failed to fetch feed {url}: {e}")
    return feedparser.FeedParserDict(entries=[])


_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch_crossref_feed(issn: str) -> feedparser.FeedParserDict:
    """Query CrossRef API for recent articles from a journal by ISSN.

    Returns a feedparser.FeedParserDict with entries populated from the API
    response, so the rest of the pipeline can treat it identically to an RSS feed.
    CrossRef is freely accessible from any IP, unlike rss.sciencedirect.com.
    """
    url = f"https://api.crossref.org/journals/{issn}/works?sort=published&order=desc&rows=10&mailto=locreport@locreport.com"
    try:
        resp = req_lib.get(url, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"Failed to fetch CrossRef feed for ISSN {issn}: {e}")
        return feedparser.FeedParserDict(entries=[])

    items = data.get("message", {}).get("items", [])
    entries = []
    for item in items:
        titles = item.get("title", [])
        if not titles:
            continue
        title = titles[0]

        doi_url = item.get("URL", "")
        if not doi_url:
            continue

        # Extract publication date
        published = item.get("published", item.get("published-print", item.get("published-online", {})))
        date_parts = published.get("date-parts", [[]])[0] if published else []
        if len(date_parts) >= 3:
            pub_dt = datetime.datetime(date_parts[0], date_parts[1], date_parts[2], tzinfo=datetime.timezone.utc)
        elif len(date_parts) == 2:
            pub_dt = datetime.datetime(date_parts[0], date_parts[1], 1, tzinfo=datetime.timezone.utc)
        elif len(date_parts) == 1:
            pub_dt = datetime.datetime(date_parts[0], 1, 1, tzinfo=datetime.timezone.utc)
        else:
            pub_dt = datetime.datetime.now(datetime.timezone.utc)

        # Abstract (JATS XML tags stripped)
        abstract_raw = item.get("abstract", "")
        abstract = re.sub(r"<[^>]+>", " ", abstract_raw).strip()

        entry = feedparser.FeedParserDict(
            title=title,
            link=doi_url,
            summary=abstract,
            published_parsed=pub_dt.timetuple(),
        )
        # Store real publisher — DOI URLs would otherwise resolve to "doi.org"
        entry["_publisher_override"] = "sciencedirect.com"
        entries.append(entry)

    result = feedparser.FeedParserDict(entries=entries)
    print(f"CrossRef ISSN {issn}: fetched {len(entries)} entries")
    return result


def extract_article_text(url: str) -> str:
    """Fetch and extract readable article text from a URL.

    Tries trafilatura's built-in fetcher first; falls back to requests with a
    full browser User-Agent for sites that block trafilatura's default UA.
    """
    downloaded = trafilatura.fetch_url(url)
    if not downloaded:
        try:
            resp = req_lib.get(url, headers=_BROWSER_HEADERS, timeout=15, allow_redirects=True)
            if resp.ok:
                downloaded = resp.text
        except Exception:
            pass
    if not downloaded:
        return ""

    extracted = trafilatura.extract(downloaded, include_comments=False, include_tables=False) or ""
    return normalize_text(extracted)


def is_bare_domain_url(url: str) -> bool:
    """Return True if the URL resolves to a site root with no article path."""
    try:
        path = urlparse(url).path.strip("/")
        return not path
    except Exception:
        return False


def is_google_news_url(url: str) -> bool:
    try:
        return urlparse(url or "").netloc.lower().endswith("news.google.com")
    except Exception:
        return False


def resolve_google_news_url(url: str, timeout: int = 10) -> str:
    """Follow the Google News redirect and return the final article URL.

    Google News RSS links are redirect wrappers (news.google.com/rss/articles/…)
    that issue a 301/302 to the real publisher URL. Uses requests (with a browser
    User-Agent) as the primary resolver since Google sometimes rejects minimal UAs;
    falls back to urllib on requests failure.
    Falls back to the original URL on any error.
    """
    for attempt in ("requests", "urllib"):
        try:
            if attempt == "requests":
                resp = req_lib.get(url, headers=_BROWSER_HEADERS, timeout=timeout, allow_redirects=True)
                final = resp.url
            else:
                opener = urllib.request.build_opener()
                opener.addheaders = [("User-Agent", "Mozilla/5.0")]
                with opener.open(url, timeout=timeout) as response:
                    final = response.url
            resolved = normalize_url(final)
            if resolved and not is_google_news_url(resolved) and not is_bare_domain_url(resolved):
                return resolved
        except Exception:
            continue
    return url


def extract_links_from_html(text: str) -> list[str]:
    if not text:
        return []
    return re.findall(r'href=["\'](https?://[^"\']+)["\']', text)


def candidate_urls_for_entry(entry) -> list[str]:
    candidates = []

    primary_link = normalize_url(getattr(entry, "link", ""))
    if primary_link:
        candidates.append(primary_link)

    if primary_link and is_google_news_url(primary_link):
        # 1. Follow the redirect — most reliable, works for any Google News link.
        resolved = resolve_google_news_url(primary_link)
        if resolved and resolved != primary_link:
            candidates.append(resolved)
        else:
            # 2. Fallback: source.href embedded in the feed XML.
            source = getattr(entry, "source", None)
            source_href = normalize_url(getattr(source, "href", "")) if source else ""
            if source_href:
                candidates.append(source_href)

            # 3. Fallback: links scraped from the summary HTML.
            summary_html = getattr(entry, "summary", "") or getattr(entry, "description", "")
            for link in extract_links_from_html(summary_html):
                normalized = normalize_url(link)
                if normalized and not is_google_news_url(normalized):
                    candidates.append(normalized)

    deduped = []
    seen = set()
    for url in candidates:
        if url and url not in seen:
            deduped.append(url)
            seen.add(url)
    return deduped


def title_keywords(title: str) -> set[str]:
    tokens = re.findall(r"[a-zA-Z]{4,}", (title or "").lower())
    return {token for token in tokens if token not in {"with", "from", "into", "that", "this"}}


def has_title_overlap(text: str, title: str) -> bool:
    keywords = title_keywords(title)
    if not keywords:
        return True
    text_l = text.lower()
    overlap = sum(1 for kw in keywords if kw in text_l)
    return overlap >= 1


def boilerplate_hits(text: str) -> int:
    text_l = text.lower()
    return sum(1 for pattern in BOILERPLATE_PATTERNS if re.search(pattern, text_l))


def is_usable_article_text(text: str, title: str) -> bool:
    cleaned = normalize_text(text)
    if len(cleaned) < MIN_ARTICLE_CHARS:
        return False

    if len(cleaned.split()) < MIN_ARTICLE_WORDS:
        return False

    if boilerplate_hits(cleaned) >= 3:
        return False

    if not has_title_overlap(cleaned, title):
        return False

    return True


def parse_signal_ids_from_yaml(path: str) -> list[str]:
    if not os.path.exists(path):
        return []

    ids = []
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if line.startswith("- id:"):
                ids.append(line.split(":", 1)[1].strip().strip('"').strip("'"))
    return ids


KNOWN_SIGNAL_IDS = set(parse_signal_ids_from_yaml(SIGNALS_FILE))


def parse_signal_titles_from_yaml(path: str) -> dict[str, str]:
    """Return a dict mapping signal id -> title from the signals YAML file."""
    if not os.path.exists(path):
        return {}
    titles: dict[str, str] = {}
    current_id = ""
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if line.startswith("- id:"):
                current_id = line.split(":", 1)[1].strip().strip('"').strip("'")
            elif line.startswith("title:") and current_id:
                titles[current_id] = line.split(":", 1)[1].strip().strip('"').strip("'")
    return titles


SIGNAL_TITLES = parse_signal_titles_from_yaml(SIGNALS_FILE)

SIGNAL_KEYWORDS = {
    # category: quality
    "quality-gap-closure": [
        "human-in-the-loop", "HITL", "human review", "post-editing quality",
        "quality validation", "MQM", "LQA", "linguistic quality",
        "quality assurance", "human evaluator", "error annotation",
    ],
    # category: quality
    "measurable-quality-evaluation": [
        "MQM", "COMET", "BLEU", "quality metric", "evaluation benchmark",
        "quality score", "quality assessment", "error rate", "fluency score",
        "adequacy", "quality framework", "automatic evaluation",
    ],
    # category: governance
    "governance-in-ai-workflows": [
        "AI governance", "audit trail", "guardrail", "content policy",
        "responsible AI", "model oversight", "human oversight",
        "approval workflow", "review gate", "AI risk", "explainability",
    ],
    # category: governance
    "regulatory-fragmentation": [
        "EU AI Act", "AI regulation", "language law", "language mandate",
        "compliance requirement", "GDPR language", "accessibility law",
        "regional regulation", "national AI policy",
    ],
    # category: operations
    "localization-operating-system": [
        "TMS", "translation management", "end-to-end platform",
        "localization platform", "content orchestration", "connector",
        "integrations hub", "localization stack", "vendor management system",
        "unified workflow", "point tools",
    ],
    # category: operations
    "translation-memory-obsolescence": [
        "translation memory", "TM", "CAT tool", "fuzzy match",
        "segment reuse", "TM leverage", "legacy TM", "TM discount",
        "SDL Trados", "memoQ", "Wordfast", "TM-based",
    ],
    # category: operations
    "agentic-localization-workflows": [
        "agentic", "AI agent", "autonomous localization", "no-touch",
        "fully automated", "self-managing", "agent pipeline",
        "orchestration agent", "LLM agent", "multi-agent",
    ],
    # category: operations
    "multimodal-content-localization": [
        "dubbing", "voice-over", "subtitle", "audio localization",
        "video localization", "image localization", "lip sync",
        "visual localization", "multimedia localization", "screen content",
    ],
    # category: market
    "human-post-editing-contraction": [
        "MTPE", "post-editing rates", "freelance translator",
        "translator demand", "job displacement", "post-editor",
        "MTPE volume", "translator employment", "rate decline",
        "post-editing market", "human translator market",
    ],
    # category: strategy
    "localization-first-content-design": [
        "localization-first", "i18n", "internationalization",
        "locale-aware", "transcreation brief", "structured content",
        "content design", "global content strategy",
        "source content quality", "locale-ready",
    ],
}


NEGATIVE_MARKERS = [
    "failed", "fails", "lawsuit", "criticized", "criticises", "criticizes", "serious issue", "data quality issues"
]
MIXED_MARKERS = ["however", "but", "trade-off", "while"]


def infer_signal_tags(title: str, gist: str) -> tuple[list[str], str, str]:
    text = f"{title} {gist}".lower()

    matched = []
    for signal_id, keywords in SIGNAL_KEYWORDS.items():
        if signal_id not in KNOWN_SIGNAL_IDS:
            continue
        hits = sum(1 for kw in keywords if kw in text)
        if hits >= 2:
            matched.append(signal_id)

    if any(marker in text for marker in NEGATIVE_MARKERS):
        stance = "contradicts"
    elif any(marker in text for marker in MIXED_MARKERS):
        stance = "mixed"
    else:
        stance = "supports" if matched else "mentions"

    confidence = "high" if len(matched) >= 2 else "medium" if len(matched) == 1 else "low"
    return matched, stance, confidence


# Terms that confirm an article is genuinely about language/translation services,
# not about "localization" in the automotive/manufacturing/supply-chain sense.
LANGUAGE_SERVICES_INDICATORS = [
    "translat",           # translation, translate, translator, translating
    "language service",
    "multilingual",
    "machine translation",
    "post-edit",
    "tms",
    "cat tool",
    "subtitl",
    "dubbing",
    "interpreting",
    "interpreter",
    "language technology",
    "language ai",
    "ai translation",
    "language pair",
    "source language",
    "target language",
    "natural language processing",
    " l10n",
    " i18n",
    "internationalization",
    "linguistic",
    "localization platform",
    "localization software",
    "localization tool",
    "software localization",
    "content localization",
    "localization workflow",
    "language model",
]


def is_language_services_relevant(title: str, text: str) -> bool:
    """Return True only if the article is genuinely about language/translation services.

    Guards against Google News false positives where 'localization' appears in an
    automotive, manufacturing, or supply-chain context rather than a language services one.
    """
    combined = f"{title} {text[:5000]}".lower()
    return any(indicator in combined for indicator in LANGUAGE_SERVICES_INDICATORS)


SEGMENT_KEYWORDS = {
    "LSPs": [
        "language service", "LSP", "translation company", "vendor",
        "translation agency", "service provider", "freelance",
    ],
    "In-House Teams": [
        "in-house", "enterprise", "localization team", "localization manager",
        "global content", "internal team", "brand", "product team",
    ],
    "Tech Vendors": [
        "platform", "TMS", "tool", "software", "SaaS", "API",
        "integration", "SDK", "plugin", "startup",
    ],
    "Translators": [
        "translator", "linguist", "post-editor", "freelance",
        "interpreter", "language professional", "MTPE",
    ],
}

TIME_HORIZON_KEYWORDS = {
    "now": [
        "launched", "releases", "now available", "announces",
        "rolls out", "deploys", "ships", "immediately",
    ],
    "6months": [
        "pilot", "beta", "testing", "plans to", "roadmap",
        "upcoming", "soon", "expected", "will launch",
    ],
    "2years": [
        "research", "long-term", "vision", "future", "emerging",
        "paradigm", "transformative", "fundamental shift",
    ],
}


def infer_segments(title: str, gist: str) -> list[str]:
    """Infer which industry segments are most affected."""
    text = f"{title} {gist}".lower()
    matched = []
    for segment, keywords in SEGMENT_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw.lower() in text)
        if hits >= 1:
            matched.append(segment)
    return matched if matched else ["In-House Teams", "LSPs"]


def infer_time_horizon(title: str, gist: str) -> str:
    """Infer whether the news has immediate, medium, or long-term impact."""
    text = f"{title} {gist}".lower()
    scores = {}
    for horizon, keywords in TIME_HORIZON_KEYWORDS.items():
        scores[horizon] = sum(1 for kw in keywords if kw.lower() in text)
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "now"


def generate_intelligence(title: str, gist: str, article_text: str) -> dict:
    """Call GPT-4o-mini to generate business implications and impact score."""
    intelligence_prompt = (
        "You are a localization industry analyst. Score this article's impact on localization professionals.\n\n"
        "IMPACT SCORE CRITERIA — be conservative, default low when in doubt:\n"
        "  1 = Routine: Awards, rebrands, office openings, CEO appointments, educational guides, generic strategy pieces where localization is incidental.\n"
        "  2 = Notable: New product/service launch, relevant research, institutional hiring signals, best-practice content with specific workflow detail, industry events with concrete takeaways.\n"
        "  3 = Significant: Quantified shift in localization quality/speed/cost from a named tool or vendor; regulatory development directly affecting language services; M&A that reshapes a market segment.\n"
        "  4 = Major: Documented, large-scale disruption to business models or competitive positioning with hard evidence (e.g. 50%+ cost reduction adopted enterprise-wide, major platform mandating AI translation, significant workforce contraction data).\n"
        "  5 = Disruptive: Paradigm-shifting event that obsoletes current localization workflows or business models industry-wide (e.g. dominant MT provider shutting down, regulatory ban on human translation in a major domain).\n\n"
        "SCORING GATES — score 4 or 5 ONLY IF all of these are true:\n"
        "  - The article is about a real, verifiable event (not a prediction, award, or opinion piece)\n"
        "  - The impact is direct and primary to localization, not incidental\n"
        "  - There is quantified evidence (numbers, percentages, named customers, dates)\n\n"
        "Provide:\n"
        "1. impact_score: integer 1-5 using the criteria above\n"
        "2. business_implications: exactly 3 short bullet points (max 15 words each) "
        "describing concrete business impact for localization professionals.\n\n"
        "Respond ONLY in this exact format (no markdown, no extra text):\n"
        "IMPACT: <number>\n"
        "IMPLICATION: <first implication>\n"
        "IMPLICATION: <second implication>\n"
        "IMPLICATION: <third implication>\n\n"
        f"Title: {title}\n\n"
        f"Summary: {gist}\n\n"
        f"Article excerpt: {article_text[:3000]}"
    )

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a concise localization industry analyst. Follow the output format exactly."},
                {"role": "user", "content": intelligence_prompt},
            ],
            max_tokens=200,
            temperature=0.3,
        )
        raw = resp.choices[0].message.content.strip()

        # Parse the structured response
        impact_score = 2  # default
        implications = []
        for line in raw.split("\n"):
            line = line.strip()
            if line.upper().startswith("IMPACT:"):
                try:
                    score = int(line.split(":", 1)[1].strip().split()[0])
                    impact_score = max(1, min(5, score))
                except (ValueError, IndexError):
                    pass
            elif line.upper().startswith("IMPLICATION:"):
                impl = line.split(":", 1)[1].strip()
                if impl:
                    implications.append(impl)

        if not implications:
            implications = ["Monitor for workflow impact", "Review vendor positioning", "Assess strategic relevance"]

        time_horizon = infer_time_horizon(title, gist)
        affected_segments = infer_segments(title, gist)

        return {
            "impact_score": impact_score,
            "time_horizon": time_horizon,
            "affected_segments": affected_segments,
            "business_implications": implications[:3],
        }
    except Exception as e:
        print(f"Intelligence generation error: {e}")
        return {
            "impact_score": 2,
            "time_horizon": infer_time_horizon(title, gist),
            "affected_segments": infer_segments(title, gist),
            "business_implications": ["Monitor for workflow impact", "Review vendor positioning", "Assess strategic relevance"],
        }


# ── Theory article prompts and intelligence ──

THEORY_GIST_SYSTEM_PROMPT = """You are a science writer summarizing research for language professionals. \
Your readers are linguists, computational linguists, and localization researchers who want to understand \
new findings in linguistic and communication theory.

Write a clear, engaging summary in 3 short paragraphs (140–250 words total).

Opening paragraph: State the research question or finding and who conducted the study. Lead with the core contribution.

Middle paragraph: Explain the methodology and key results. Use precise terminology but remain accessible to \
adjacent disciplines. Highlight what is novel compared to prior work.

Closing paragraph: Note the theoretical significance and any practical implications for language technology, \
translation studies, or communication science.

Tone and style:
• Scholarly but accessible — no jargon without context.
• Precise and evidence-based — cite numbers and methods from the source.
• No business framing, no market language, no industry impact.
• Neutral and informative — present findings, not opinions.
• The summary should make a language researcher curious enough to read the full paper.

If the provided text is mostly cookie/privacy/legal notices rather than article content, respond exactly with: UNUSABLE_CONTENT"""

RESEARCH_DOMAINS = [
    "phonetics", "phonology", "morphology", "syntax", "semantics",
    "pragmatics", "psycholinguistics", "sociolinguistics", "neurolinguistics",
    "computational linguistics", "corpus linguistics", "historical linguistics",
    "linguistic typology", "language acquisition", "discourse analysis",
    "translation studies", "communication theory", "applied linguistics",
]


def generate_theory_intelligence(title: str, gist: str, article_text: str) -> dict:
    """Generate research-oriented intelligence for theory articles."""
    intelligence_prompt = (
        "You are an academic reviewer assessing a linguistics or communication theory article.\n\n"
        "RELEVANCE SCORE CRITERIA:\n"
        "  1 = Peripheral: Tangentially related to language/communication, narrow scope.\n"
        "  2 = Relevant: Contributes to a specific subfield of linguistics or communication theory.\n"
        "  3 = Notable: Significant finding with cross-disciplinary implications within language sciences.\n"
        "  4 = Major: Substantial contribution to theoretical understanding with broad relevance to multiple subfields.\n"
        "  5 = Groundbreaking: Paradigm-shifting finding that redefines understanding in linguistic or communication theory.\n\n"
        "RESEARCH DOMAIN — choose the single best match from this list:\n"
        f"  {', '.join(RESEARCH_DOMAINS)}\n\n"
        "Provide:\n"
        "1. relevance_score: integer 1-5 using the criteria above\n"
        "2. research_domain: one domain from the list above\n"
        "3. research_implications: exactly 3 short bullet points (max 15 words each) "
        "describing the theoretical or methodological significance.\n\n"
        "Respond ONLY in this exact format (no markdown, no extra text):\n"
        "RELEVANCE: <number>\n"
        "DOMAIN: <domain>\n"
        "IMPLICATION: <first implication>\n"
        "IMPLICATION: <second implication>\n"
        "IMPLICATION: <third implication>\n\n"
        f"Title: {title}\n\n"
        f"Summary: {gist}\n\n"
        f"Article excerpt: {article_text[:3000]}"
    )

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a concise academic reviewer specializing in linguistics and communication theory. Follow the output format exactly."},
                {"role": "user", "content": intelligence_prompt},
            ],
            max_tokens=200,
            temperature=0.3,
        )
        raw = resp.choices[0].message.content.strip()

        relevance_score = 2
        research_domain = "applied linguistics"
        implications = []
        for line in raw.split("\n"):
            line = line.strip()
            if line.upper().startswith("RELEVANCE:"):
                try:
                    score = int(line.split(":", 1)[1].strip().split()[0])
                    relevance_score = max(1, min(5, score))
                except (ValueError, IndexError):
                    pass
            elif line.upper().startswith("DOMAIN:"):
                domain = line.split(":", 1)[1].strip().lower()
                if domain in RESEARCH_DOMAINS:
                    research_domain = domain
            elif line.upper().startswith("IMPLICATION:"):
                impl = line.split(":", 1)[1].strip()
                if impl:
                    implications.append(impl)

        if not implications:
            implications = [
                "Advances theoretical understanding in the field",
                "Introduces novel methodology for future research",
                "Bridges gap between theory and language technology",
            ]

        return {
            "relevance_score": relevance_score,
            "research_domain": research_domain,
            "research_implications": implications[:3],
        }
    except Exception as e:
        print(f"Theory intelligence generation error: {e}")
        return {
            "relevance_score": 2,
            "research_domain": "applied linguistics",
            "research_implications": [
                "Advances theoretical understanding in the field",
                "Introduces novel methodology for future research",
                "Bridges gap between theory and language technology",
            ],
        }


def main() -> None:
    if os.path.exists(SEEN_FILE):
        with open(SEEN_FILE, "r", encoding="utf-8") as seen_file:
            seen = json.load(seen_file)
    else:
        seen = []

    # Separate URL entries from title entries (title entries use "title::" prefix).
    normalized_seen = {normalize_url(e) for e in seen if not e.startswith("title::")}
    seen_titles = {e[len("title::"):] for e in seen if e.startswith("title::")}
    existing_post_urls, existing_post_titles = load_existing_post_dedup_index("_posts")
    normalized_seen.update(existing_post_urls)
    seen_titles.update(existing_post_titles)
    posts = []
    count = 0

    for feed_url in FEEDS:
        if count >= MAX_ARTICLES:
            break

        if feed_url.startswith("crossref:"):
            issn = feed_url[len("crossref:"):]
            feed = fetch_crossref_feed(issn)
            is_theory_feed = True
            is_lenient_source = False
        else:
            feed = fetch_feed(feed_url)
            is_theory_feed = any(ts in feed_url.lower() for ts in THEORY_SOURCES)
            is_lenient_source = any(ls in feed_url.lower() for ls in LENIENT_SOURCES)

        for entry in feed.entries[:10]:
            if count >= MAX_ARTICLES:
                break

            candidate_urls = candidate_urls_for_entry(entry)
            if not candidate_urls:
                continue

            url = candidate_urls[0]
            google_news_source = is_google_news_url(candidate_urls[0])

            # Skip if ANY candidate URL for this entry has already been seen.
            # This handles cases where the Google News redirect URL and the
            # resolved article URL are both recorded across runs.
            if any(c in normalized_seen for c in candidate_urls):
                continue

            # Skip if the same article title has already been published,
            # even when it arrives from a different source (e.g. gala-global
            # and slator both carrying the same press release).
            entry_title_norm = normalize_title(getattr(entry, "title", ""))
            if entry_title_norm and entry_title_norm in seen_titles:
                print(f"Skipping duplicate title: '{getattr(entry, 'title', '')[:70]}'")
                continue

            # entry.summary is feedparser's canonical name for RSS <description>;
            # fall back to entry.description as alias. Strip HTML so the text is
            # usable both for quality checks and as GPT input.
            fallback_raw = getattr(entry, "summary", "") or getattr(entry, "description", "")
            fallback_description = normalize_text(strip_html(fallback_raw))

            extracted_text = ""
            for candidate_url in candidate_urls:
                extracted_text = extract_article_text(candidate_url)
                if is_usable_article_text(extracted_text, entry.title):
                    url = candidate_url
                    break
                # Lenient path for Google News / theory feeds: accept any text that
                # at least contains a title keyword — guards against homepage scrapes.
                if (google_news_source or is_theory_feed) and extracted_text and has_title_overlap(extracted_text, entry.title):
                    url = candidate_url
                    break

            if is_usable_article_text(extracted_text, entry.title):
                text = extracted_text
            elif (google_news_source or is_theory_feed or is_lenient_source) and extracted_text and has_title_overlap(extracted_text, entry.title):
                text = extracted_text
            elif is_usable_article_text(fallback_description, entry.title):
                text = fallback_description
            elif (google_news_source or is_theory_feed or is_lenient_source) and fallback_description and has_title_overlap(fallback_description, entry.title):
                text = fallback_description
            elif is_theory_feed or is_lenient_source:
                # Last resort: use title + any feed metadata as context.
                # Applies to theory feeds (short abstracts) and lenient sources
                # (RSS excerpts too short to meet normal minimums).
                entry_title = getattr(entry, "title", "")
                text = normalize_text(f"{entry_title}. {fallback_description}").strip()
                if not text:
                    print(f"Skipping (no content at all): '{entry_title[:70]}'")
                    continue
            else:
                print(
                    f"Skipping (no usable content): '{getattr(entry, 'title', url)[:70]}' | "
                    f"extracted={len(extracted_text)}c, fallback={len(fallback_description)}c, "
                    f"gnews={google_news_source}"
                )
                continue

            # ── Classify article type ──
            publisher = entry.get("_publisher_override") or get_publisher_domain(url)
            article_type = classify_article_type(publisher, text)

            # Skip industry articles that use "localization" in a non-language-services
            # sense (e.g. automotive supply-chain localization, manufacturing localization).
            if article_type == "industry" and not is_language_services_relevant(entry.title, text):
                print(f"Skipping (not language-services relevant): '{entry.title[:70]}'")
                continue

            if article_type == "theory":
                # ── Theory article: scientific gist prompt ──
                prompt = (
                    "Write a gist for this research article (120–160 words).\n"
                    "Frame it for linguists and language science researchers.\n\n"
                    f"Article text:\n{text[:15000]}"
                )
                gist_system_prompt = THEORY_GIST_SYSTEM_PROMPT
            else:
                # ── Industry article: business gist prompt ──
                prompt = (
                    "Write a gist for this article (120–160 words).\n"
                    "Frame it for a localization and language services professional audience.\n\n"
                    f"Article text:\n{text[:15000]}"
                )
                gist_system_prompt = """You are a skilled editorial writer for a localization and translation industry news platform. Your readers are professionals working in enterprise localization, language technology, translation services, and AI-driven language workflows.

Write a clear, engaging gist in 3 short paragraphs (140–250 words total).

Opening paragraph: Lead with the most significant development in a strong, direct sentence. Establish what happened and who is involved immediately.

Middle paragraph: Explain why it matters to the localization and language services industry — connect to business impact, technology trends, workflow changes, or market dynamics as relevant. Use specific details from the source material.

Closing paragraph: Offer one concrete, industry-relevant takeaway or implication.

Tone and style:
• Write like a knowledgeable colleague sharing a notable finding, not like a press release.
• Use active voice, varied sentence length, and concrete language.
• Avoid corporate jargon, filler phrases ("in a world where...", "it's worth noting that..."), and vague superlatives.
• Neutral and factual — no editorial opinion, no speculation beyond what the source states.
• The gist should make a localization professional curious enough to click through to the original article.

If the provided text is mostly cookie/privacy/legal notices rather than article content, respond exactly with: UNUSABLE_CONTENT"""

            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": gist_system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=300,
                    temperature=0.4,
                )
                gist = response.choices[0].message.content.strip()
                if gist == "UNUSABLE_CONTENT":
                    print(f"Skipping unusable generated content for {url}")
                    continue
            except Exception as e:
                print(f"OpenAI API error for {url}: {e}")
                gist = "Summary generation failed due to API error.\n\nRead the full article below."

            if "published_parsed" in entry and entry.published_parsed:
                pub_dt = datetime.datetime(*entry.published_parsed[:6], tzinfo=datetime.timezone.utc)
            else:
                pub_dt = datetime.datetime.now(datetime.timezone.utc)

            # Cap future dates to today — Jekyll skips future-dated posts by default,
            # and CrossRef often returns scheduled print dates ahead of today.
            now = datetime.datetime.now(datetime.timezone.utc)
            if pub_dt > now:
                pub_dt = now

            post_date_str = pub_dt.strftime("%Y-%m-%d")
            time_str = pub_dt.strftime("%H:%M:%S")

            slug_raw = re.sub(r"\s+", "-", entry.title.lower().strip())
            slug = "".join(c for c in slug_raw if c.isalnum() or c == "-")[:60].strip("-")
            if not slug:
                slug = f"article-{int(pub_dt.timestamp())}"

            filename = f"_posts/{post_date_str}-{slug}.md"
            suffix = 1
            while os.path.exists(filename):
                filename = f"_posts/{post_date_str}-{slug}-{suffix}.md"
                suffix += 1

            safe_title = yaml_escape(entry.title)
            safe_excerpt = yaml_escape(gist[:160])
            safe_publisher = yaml_escape(publisher)
            safe_source_url = yaml_escape(url)

            if article_type == "theory":
                # ── Theory intelligence and front matter ──
                theory_intel = generate_theory_intelligence(entry.title, gist, text[:15000])
                relevance_score = theory_intel["relevance_score"]
                research_domain = theory_intel["research_domain"]
                implications_yaml = "\n".join(
                    f'  - "{yaml_escape(impl)}"' for impl in theory_intel["research_implications"]
                )

                md_content = f"""---
title: "{safe_title}"
date: {post_date_str}T{time_str}Z
layout: post
categories: [theory]
tags: [linguistics, research, theory, gist]
article_type: "theory"
excerpt: "{safe_excerpt}..."
publisher: "{safe_publisher}"
source_url: "{safe_source_url}"
relevance_score: {relevance_score}
research_domain: "{research_domain}"
research_implications:
{implications_yaml}
---

{gist}

Source: [{safe_publisher}]({safe_source_url})"""

            else:
                # ── Industry intelligence and front matter ──
                intelligence = generate_intelligence(entry.title, gist, text[:15000])
                signal_ids, signal_stance, signal_confidence = infer_signal_tags(entry.title, gist)
                signal_ids_yaml = ", ".join(signal_ids)

                signal_ref = ""
                if signal_confidence == "high" and signal_ids:
                    first_signal = signal_ids[0]
                    signal_title = SIGNAL_TITLES.get(first_signal, "")
                    if signal_title:
                        signal_ref = (
                            f"\n*LocReport tracks this as an industry signal: "
                            f"[{signal_title}](/signals/#{first_signal})*\n"
                        )

                impact_score = intelligence["impact_score"]
                time_horizon = intelligence["time_horizon"]
                affected_segments_yaml = ", ".join(intelligence["affected_segments"])
                implications_yaml = "\n".join(
                    f'  - "{yaml_escape(impl)}"' for impl in intelligence["business_implications"]
                )

                md_content = f"""---
title: "{safe_title}"
date: {post_date_str}T{time_str}Z
layout: post
categories: [{YOUR_AREA.lower()}]
tags: [translation, localization, news, gist]
article_type: "industry"
excerpt: "{safe_excerpt}..."
publisher: "{safe_publisher}"
source_url: "{safe_source_url}"
signal_ids: [{signal_ids_yaml}]
signal_stance: {signal_stance}
signal_confidence: {signal_confidence}
impact_score: {impact_score}
time_horizon: "{time_horizon}"
affected_segments: [{affected_segments_yaml}]
business_implications:
{implications_yaml}
---

{gist}
{signal_ref}
Source: [{safe_publisher}]({safe_source_url})
"""

            os.makedirs("_posts", exist_ok=True)
            with open(filename, "w", encoding="utf-8") as f:
                f.write(md_content)

            posts.append(
                {
                    "title": entry.title,
                    "publisher": publisher,
                    "url": url,
                    "gist": gist,
                    "date": post_date_str,
                }
            )

            for candidate in candidate_urls:
                if candidate not in normalized_seen:
                    seen.append(candidate)
                    normalized_seen.add(candidate)
            if entry_title_norm and entry_title_norm not in seen_titles:
                seen.append(f"title::{entry_title_norm}")
                seen_titles.add(entry_title_norm)
            count += 1
            time.sleep(2)

    print(f"Generated {len(posts)} individual gist posts")
    with open(SEEN_FILE, "w", encoding="utf-8") as seen_file:
        json.dump(seen[-SEEN_HISTORY_CAP:], seen_file, indent=2)


if __name__ == "__main__":
    main()
