import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/login',
          '/CLAUDE.md',
          '/assets/',
          '/404.html',
          '/cdn-cgi/',
          '/subscribe/',
        ],
      },
    ],
    sitemap: 'https://locreport.com/sitemap.xml',
  }
}
