/**
 * SEO metadata utilities for SpecTree.
 * Provides functions to generate Open Graph tags, structured data (JSON-LD),
 * sitemaps, and robots.txt content.
 */

export interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogType: string;
  canonical?: string;
  noIndex: boolean;
}

export const DEFAULT_METADATA: PageMetadata = {
  title: 'SpecTree - AI-Powered Software Design Documents',
  description:
    'Transform project ideas into comprehensive software design documents with AI assistance. Generate epics, features, user stories, and tasks automatically.',
  keywords: [
    'software design',
    'specification',
    'AI',
    'project management',
    'SDD',
    'agile',
  ],
  ogType: 'website',
  noIndex: false,
};

/**
 * Builds a page title in the format "page | SpecTree" or just "SpecTree"
 * if no page name is provided.
 */
export function buildPageTitle(page?: string): string {
  if (!page) return 'SpecTree';
  return `${page} | SpecTree`;
}

/**
 * Generates an array of Open Graph meta tag objects from page metadata.
 */
export function generateOpenGraphTags(
  metadata: PageMetadata,
): { property: string; content: string }[] {
  const tags: { property: string; content: string }[] = [
    { property: 'og:title', content: metadata.title },
    { property: 'og:description', content: metadata.description },
    { property: 'og:type', content: metadata.ogType },
  ];

  if (metadata.ogImage) {
    tags.push({ property: 'og:image', content: metadata.ogImage });
  }

  if (metadata.canonical) {
    tags.push({ property: 'og:url', content: metadata.canonical });
  }

  return tags;
}

export interface StructuredDataOrganization {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}

export interface StructuredDataWebApplication {
  name: string;
  url: string;
  description: string;
  applicationCategory?: string;
  operatingSystem?: string;
}

export interface StructuredDataFAQ {
  questions: { question: string; answer: string }[];
}

type StructuredDataInput =
  | StructuredDataOrganization
  | StructuredDataWebApplication
  | StructuredDataFAQ;

/**
 * Generates JSON-LD structured data for the given schema type.
 * Supports Organization, WebApplication, and FAQ types.
 */
export function generateStructuredData(
  type: 'Organization' | 'WebApplication' | 'FAQ',
  data: StructuredDataInput,
): string {
  const generators: Record<string, (d: StructuredDataInput) => object> = {
    Organization: (d) => {
      const orgData = d as StructuredDataOrganization;
      const result: Record<string, string> = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: orgData.name,
        url: orgData.url,
      };
      if (orgData.logo) result.logo = orgData.logo;
      if (orgData.description) result.description = orgData.description;
      return result;
    },

    WebApplication: (d) => {
      const appData = d as StructuredDataWebApplication;
      const result: Record<string, string> = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: appData.name,
        url: appData.url,
        description: appData.description,
      };
      if (appData.applicationCategory) {
        result.applicationCategory = appData.applicationCategory;
      }
      if (appData.operatingSystem) {
        result.operatingSystem = appData.operatingSystem;
      }
      return result;
    },

    FAQ: (d) => {
      const faqData = d as StructuredDataFAQ;
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqData.questions.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      };
    },
  };

  const generator = generators[type];
  if (!generator) {
    throw new Error(`Unsupported structured data type: ${type}`);
  }

  const jsonLd = generator(data);
  return `<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`;
}

export interface SitemapPage {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

/**
 * Generates an XML sitemap string from an array of page definitions.
 */
export function generateSitemap(pages: SitemapPage[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const page of pages) {
    lines.push('  <url>');
    lines.push(`    <loc>${page.url}</loc>`);
    lines.push(`    <lastmod>${page.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${page.changefreq}</changefreq>`);
    lines.push(`    <priority>${page.priority.toFixed(1)}</priority>`);
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

export interface RobotsTxtConfig {
  userAgent?: string;
  allow: string[];
  disallow: string[];
  sitemapUrl?: string;
}

/**
 * Generates robots.txt content from a configuration object.
 */
export function generateRobotsTxt(config: RobotsTxtConfig): string {
  const lines: string[] = [];

  lines.push(`User-agent: ${config.userAgent || '*'}`);

  for (const path of config.allow) {
    lines.push(`Allow: ${path}`);
  }

  for (const path of config.disallow) {
    lines.push(`Disallow: ${path}`);
  }

  if (config.sitemapUrl) {
    lines.push('');
    lines.push(`Sitemap: ${config.sitemapUrl}`);
  }

  lines.push('');
  return lines.join('\n');
}
