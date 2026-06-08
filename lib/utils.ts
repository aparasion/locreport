const DOMAIN_PUBLISHER_MAP: Record<string, string> = {
  'locreport.com': 'LocReport',
  'slator.com': 'Slator',
  'argosmultilingual.com': 'Argos Multilingual',
  'argos-multilingual.com': 'Argos Multilingual',
  'nimdzi.com': 'Nimdzi Insights',
  'csa-research.com': 'CSA Research',
  'common-sense-advisory.com': 'Common Sense Advisory',
  'multilingual.com': 'Multilingual',
  'gala-global.org': 'GALA',
  'taus.net': 'TAUS',
  'atanet.org': 'ATA',
  'proz.com': 'ProZ',
  'translatorscafe.com': 'TranslatorsCafe',
  'tcworld.info': 'tcworld',
  'sdl.com': 'SDL',
  'rws.com': 'RWS',
  'translated.com': 'Translated',
  'lionbridge.com': 'Lionbridge',
  'transperfect.com': 'TransPerfect',
  'welocalize.com': 'Welocalize',
  'languageline.com': 'LanguageLine',
  'moravia.com': 'Moravia',
  'xillio.com': 'Xillio',
  'memsource.com': 'Memsource',
  'phrase.com': 'Phrase',
  'smartling.com': 'Smartling',
  'transifex.com': 'Transifex',
  'crowdin.com': 'Crowdin',
  'lokalise.com': 'Lokalise',
  'matecat.com': 'MateCat',
  'wordbee.com': 'Wordbee',
  'xtm-intl.com': 'XTM International',
  'globalese.com': 'Globalese',
  'lilt.com': 'Lilt',
  'modernmt.eu': 'ModernMT',
  'unbabel.com': 'Unbabel',
  'deepl.com': 'DeepL',
  'google.com': 'Google',
  'microsoft.com': 'Microsoft',
  'amazon.com': 'Amazon',
  'openai.com': 'OpenAI',
  'techcrunch.com': 'TechCrunch',
  'wired.com': 'Wired',
  'theverge.com': 'The Verge',
  'forbes.com': 'Forbes',
  'reuters.com': 'Reuters',
  'bloomberg.com': 'Bloomberg',
}

export function domainToPublisher(hostname: string): string {
  const clean = hostname.replace(/^www\./, '').toLowerCase()
  if (DOMAIN_PUBLISHER_MAP[clean]) return DOMAIN_PUBLISHER_MAP[clean]
  // Generic fallback: strip TLD, split on hyphens/dots, title-case each word
  const withoutTld = clean.replace(/\.[^.]+$/, '')
  return withoutTld
    .split(/[-.]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Returns the bare slug (last segment only) for use in article URLs.
// DB slugs are stored as "2026/06/04/article-name"; URLs use "/articles/article-name".
export function articleHref(slug: string): string {
  return `/articles/${slug.split('/').pop()}`
}

// Extracts 1-2 plain-text sentences from markdown content for use as a teaser.
export function extractTeaser(content: string, maxSentences = 1): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, '')           // fenced code blocks
    .replace(/`[^`\n]+`/g, '')               // inline code
    .replace(/!\[.*?\]\(.*?\)/g, '')          // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → keep text
    .replace(/^#{1,6}\s+/gm, '')             // headings
    .replace(/^[-*_]{3,}\s*$/gm, '')         // horizontal rules
    .replace(/^\s*[-*+]\s+/gm, '')           // unordered list items
    .replace(/^\s*\d+\.\s+/gm, '')           // ordered list items
    .replace(/[*_]{1,3}([^*_\n]+)[*_]{1,3}/g, '$1') // bold / italic
    .replace(/~~([^~\n]+)~~/g, '$1')         // strikethrough
    .replace(/<[^>]+>/g, '')                 // HTML tags
    .replace(/\n+/g, ' ')                   // newlines → space
    .trim()

  const sentences = plain.match(/[^.!?]*[.!?]+(?:\s|$)/g) ?? []
  const result = sentences.slice(0, maxSentences).join('').trim()
  return result || plain.slice(0, 140).trim()
}
