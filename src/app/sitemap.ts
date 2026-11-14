import { MetadataRoute } from 'next';
import { DELHI_NCR_STATIONS, POPULAR_UNMONITORED_LOCALITIES } from '@/lib/fixtures/delhi-stations';
import { getSiteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  const now = new Date();
  // Fixed release date for verified educational and static knowledge resources
  const contentReleaseDate = new Date('2024-11-01T00:00:00.000Z');

  // City pages
  const cities = ['delhi', 'noida', 'gurugram', 'ghaziabad', 'faridabad'];
  const cityUrls: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${siteUrl}/${city}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  // Delhi locality pages - derived from verified station registry
  const delhiStations = DELHI_NCR_STATIONS.filter((s) => s.city === 'Delhi');
  const delhiLocalityUrls: MetadataRoute.Sitemap = delhiStations.map((station) => ({
    url: `${siteUrl}/delhi/${station.slug}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.85,
  }));

  // Noida locality pages
  const unmonSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const unmonDelhi = POPULAR_UNMONITORED_LOCALITIES.filter((u) => u.city === 'Delhi');
  const unmonDelhiUrls: MetadataRoute.Sitemap = unmonDelhi.map((u) => ({
    url: `${siteUrl}/delhi/${unmonSlug(u.name)}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  const noidaStations = DELHI_NCR_STATIONS.filter((s) => s.city === 'Noida');
  const noidaLocalityUrls: MetadataRoute.Sitemap = noidaStations.map((station) => ({
    url: `${siteUrl}/noida/${station.slug}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.75,
  }));

  // Learn / Knowledge Centre articles
  const learnArticles = [
    'what-is-aqi',
    'pm25-vs-pm10',
    'indian-aqi-categories',
    'how-aqi-is-calculated',
    'air-pollution-health-effects',
    'how-to-read-aqi',
    'delhi-pollution-guide',
  ];
  const learnUrls: MetadataRoute.Sitemap = learnArticles.map((slug) => ({
    url: `${siteUrl}/learn/${slug}`,
    lastModified: contentReleaseDate,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  const staticPages: MetadataRoute.Sitemap = ['about', 'contact', 'privacy', 'terms', 'disclaimer'].map((slug) => ({
    url: `${siteUrl}/${slug}`,
    lastModified: contentReleaseDate,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/learn`,
      lastModified: contentReleaseDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...cityUrls,
    ...delhiLocalityUrls,
    ...unmonDelhiUrls,
    ...noidaLocalityUrls,
    ...learnUrls,
    ...staticPages,
  ];
}
