import feedparser, os, json, datetime, requests, trafilatura, time
from openai import OpenAI  # ← new import

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

FEEDS = [
    https://news.google.com/rss/search?q=translation+localization+OR+topic+when:1d",  # Google News RSS
]
SEEN_FILE = "seen.json"
YOUR_AREA = "Translation"
MAX_ARTICLES = 18

seen = json.load(open(SEEN_FILE)) if os.path.exists(SEEN_FILE) else []
posts = []
count = 0

for feed_url in FEEDS:
    if count >= MAX_ARTICLES:
        break
    feed = feedparser.parse(feed_url)
    for entry in feed.entries[:10]:
        if count >= MAX_ARTICLES:
            break
        url = entry.link
        if url in seen:
            continue

        downloaded = trafilatura.fetch_url(url)
        text = trafilatura.extract(downloaded, include_comments=False) or entry.description

        prompt = f"""Create a concise gist (3–5 bullets or 100–200 words) of this article. 
Focus on key facts, implications. End with source: {url}

Article text:
{text[:15000]}"""  # ← OpenAI likes clearer prompts

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # cheap & good (~$0.15/1M input tokens); alt: "gpt-3.5-turbo" even cheaper
                messages=[
                    {"role": "system", "content": "You are a helpful news summarizer."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,          # limit output length to save $
                temperature=0.3          # lower = more factual/consistent
            )
            gist = response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI API error for {url}: {e}")
            gist = f"Summary failed (API error). Read full article: {url}"

        posts.append({"title": entry.title, "url": url, "gist": gist, "date": entry.published})
        seen.append(url)
        count += 1

        time.sleep(2)  # small delay; OpenAI allows bursts, but polite to add

# Generate Jekyll post (unchanged)
today = datetime.date.today().isoformat()
md_content = f"""---
title: "{YOUR_AREA} News Gists - {today}"
date: {today}
layout: post
---

## Today's AI-curated gists

"""
for p in posts:
    md_content += f"### [{p['title']}]({p['url']})\n\n{p['gist']}\n\n---\n\n"

with open(f"_posts/{today}-news-gist.md", "w") as f:
    f.write(md_content)

json.dump(seen[-500:], open(SEEN_FILE, "w"))
