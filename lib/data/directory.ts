export interface DirectoryEntry {
  name: string
  category: string
  website: string
  description: string
  founded: number
  hq: string
  type: string
  tags: string[]
}

export const DIRECTORY: DirectoryEntry[] = [
  { name: 'Phrase', category: 'tms', website: 'https://phrase.com', description: 'Enterprise-grade TMS with a unified localization platform covering strings, files, and over-the-air updates.', founded: 2012, hq: 'Hamburg, Germany', type: 'SaaS', tags: ['tms', 'api', 'connectors'] },
  { name: 'Lokalise', category: 'tms', website: 'https://lokalise.com', description: 'Developer-first TMS with real-time collaboration, branching, and 50+ integrations for continuous localization.', founded: 2017, hq: 'Riga, Latvia', type: 'SaaS', tags: ['tms', 'api', 'developer-tools'] },
  { name: 'Smartling', category: 'tms', website: 'https://smartling.com', description: 'Cloud TMS with visual context, AI translation workflows, and quality automation for global enterprises.', founded: 2009, hq: 'New York, USA', type: 'SaaS', tags: ['tms', 'ai', 'enterprise'] },
  { name: 'Crowdin', category: 'tms', website: 'https://crowdin.com', description: 'Collaborative localization platform popular with open-source projects, games, and software teams.', founded: 2009, hq: 'Kyiv, Ukraine', type: 'SaaS', tags: ['tms', 'open-source'] },
  { name: 'Transifex', category: 'tms', website: 'https://transifex.com', description: 'Agile translation management with native integrations for GitHub, Figma, and CI/CD pipelines.', founded: 2010, hq: 'San Francisco, USA', type: 'SaaS', tags: ['tms', 'developer-tools'] },
  { name: 'XTM Cloud', category: 'tms', website: 'https://xtm.cloud', description: 'Enterprise TMS with advanced workflow automation, AI quality prediction, and MT integration.', founded: 2002, hq: 'Guildford, UK', type: 'SaaS', tags: ['tms', 'enterprise'] },
  { name: 'DeepL', category: 'ai-mt', website: 'https://deepl.com', description: 'Neural machine translation engine renowned for natural-sounding output across 30+ languages.', founded: 2017, hq: 'Cologne, Germany', type: 'SaaS / API', tags: ['ai-mt'] },
  { name: 'Google Translate', category: 'ai-mt', website: 'https://translate.google.com', description: 'Free neural MT service supporting 130+ languages with document, image, and voice translation.', founded: 2006, hq: 'Mountain View, USA', type: 'Free / API', tags: ['ai-mt'] },
  { name: 'Microsoft Translator', category: 'ai-mt', website: 'https://translator.microsoft.com', description: 'Cloud MT API with 100+ languages, custom model training, and real-time conversation translation.', founded: 2009, hq: 'Redmond, USA', type: 'SaaS / API', tags: ['ai-mt'] },
  { name: 'Trados', category: 'cat', website: 'https://trados.com', description: 'Industry-leading CAT tool from RWS with rich TM, terminology, and MT integration for professional translators.', founded: 1984, hq: 'Maidenhead, UK', type: 'Desktop / Cloud', tags: ['cat'] },
  { name: 'memoQ', category: 'cat', website: 'https://memoq.com', description: 'Versatile translation environment with powerful TM, term extraction, and server-based collaboration.', founded: 2004, hq: 'Budapest, Hungary', type: 'Desktop / SaaS', tags: ['cat'] },
  { name: 'TransPerfect', category: 'lsp', website: 'https://transperfect.com', description: "World's largest privately held language services company with 6,500+ staff in 140+ cities.", founded: 1992, hq: 'New York, USA', type: 'LSP', tags: ['lsp'] },
  { name: 'Lionbridge', category: 'lsp', website: 'https://lionbridge.com', description: 'Global language services and AI training data provider serving Fortune 500 companies in 350+ languages.', founded: 1996, hq: 'Waltham, USA', type: 'LSP', tags: ['lsp'] },
  { name: 'RWS', category: 'lsp', website: 'https://rws.com', description: 'Publicly traded language services and technology group offering translation, IP services, and Trados software.', founded: 1958, hq: 'Chalfont St Peter, UK', type: 'LSP / Tech', tags: ['lsp'] },
  { name: 'Lilt', category: 'ai-mt', website: 'https://lilt.com', description: 'Human-in-the-loop AI translation platform pairing adaptive MT with professional linguists.', founded: 2015, hq: 'San Francisco, USA', type: 'SaaS', tags: ['ai-mt'] },
  { name: 'Interpreted.com', category: 'interpreting', website: 'https://interprefy.com', description: 'Remote simultaneous interpreting platform for events and meetings with AI speech translation.', founded: 2014, hq: 'Zürich, Switzerland', type: 'SaaS', tags: ['interpreting'] },
  { name: 'Slator', category: 'research', website: 'https://slator.com', description: 'B2B media and research firm covering language industry news, market intelligence, and company data.', founded: 2016, hq: 'Zürich, Switzerland', type: 'Media / Research', tags: ['research'] },
  { name: 'ZOO Digital', category: 'av-localization', website: 'https://zoodigital.com', description: 'Cloud-based media localization for OTT platforms including dubbing, subtitling, and media services.', founded: 1999, hq: 'Sheffield, UK', type: 'SaaS / Studio', tags: ['av-localization'] },
  { name: 'ElevenLabs', category: 'av-localization', website: 'https://elevenlabs.io', description: 'AI voice synthesis and dubbing platform with ultra-realistic voice cloning in 29+ languages.', founded: 2022, hq: 'New York, USA', type: 'SaaS / API', tags: ['av-localization'] },
  { name: 'Acrolinx', category: 'terminology', website: 'https://acrolinx.com', description: 'AI content governance platform that enforces style, tone, and terminology across authoring tools.', founded: 2002, hq: 'Berlin, Germany', type: 'SaaS', tags: ['terminology'] },
  { name: 'GALA', category: 'community', website: 'https://gala-global.org', description: 'Global trade association for the language services industry with events, research, and networking.', founded: 2002, hq: 'Berlin, Germany', type: 'Association', tags: ['community'] },
  { name: 'ProZ.com', category: 'community', website: 'https://proz.com', description: "World's largest online community for translators with job boards, glossaries, and certification.", founded: 1999, hq: 'Buenos Aires, Argentina', type: 'Marketplace / Community', tags: ['community'] },
  { name: 'Smartcat', category: 'tms', website: 'https://smartcat.com', description: 'AI-powered translation platform connecting businesses with a global network of 500k+ linguists.', founded: 2016, hq: 'Boston, USA', type: 'SaaS', tags: ['tms', 'ai'] },
  { name: 'ModernMT', category: 'ai-mt', website: 'https://modernmt.com', description: 'Adaptive MT engine that learns from human corrections in real time, developed by Translated.', founded: 2015, hq: 'Rome, Italy', type: 'SaaS / API', tags: ['ai-mt'] },
  { name: 'Weglot', category: 'tms', website: 'https://weglot.com', description: 'Website translation solution with automatic detection, MT integration, and multilingual SEO.', founded: 2016, hq: 'Paris, France', type: 'SaaS', tags: ['tms', 'website'] },
  { name: 'Papercup', category: 'av-localization', website: 'https://papercup.com', description: 'AI dubbing service combining synthetic voice with human QC for broadcast and enterprise video.', founded: 2017, hq: 'London, UK', type: 'SaaS', tags: ['av-localization'] },
  { name: 'Panjaya', category: 'av-localization', website: 'https://panjaya.com', description: "AI video dubbing platform that replicates original speakers' voices and lip-syncs across languages.", founded: 2018, hq: 'San Francisco, USA', type: 'SaaS', tags: ['av-localization'] },
  { name: 'Wordfast', category: 'cat', website: 'https://wordfast.com', description: 'Cross-platform CAT tool available as a standalone app or online, known for speed and TM quality.', founded: 1999, hq: 'Houston, USA', type: 'Desktop / Cloud', tags: ['cat'] },
  { name: 'OmegaT', category: 'cat', website: 'https://omegat.org', description: 'Free, open-source CAT tool with fuzzy matching, glossary support, and team project functionality.', founded: 2000, hq: 'Open Source', type: 'Open Source', tags: ['cat', 'open-source'] },
  { name: 'Welocalize', category: 'lsp', website: 'https://welocalize.com', description: 'Large LSP specializing in technology-driven translation, localization testing, and AI content services.', founded: 1997, hq: 'Frederick, USA', type: 'LSP', tags: ['lsp'] },
]
