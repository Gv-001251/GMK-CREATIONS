import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.gmk3dcreations.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/checkout/', '/api/', '/orders/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
