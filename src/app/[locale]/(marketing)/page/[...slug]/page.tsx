/* eslint-disable no-console */
/* eslint-disable react-dom/no-dangerously-set-innerhtml */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { strapiApi } from '@/libs/StrapiApi';

type PageProps = {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pageSlug = slug.join('/');

  try {
    const page = await getPageBySlug(pageSlug);

    if (!page) {
      return {
        title: 'Page Not Found',
      };
    }

    return {
      title: page.seo?.metaTitle || page.title,
      description: page.seo?.metaDescription,
      keywords: page.seo?.keywords,
      robots: page.seo?.metaRobots,
      other: {
        // canonical: page.seo?.canonicalURL,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      title: 'Page Not Found',
    };
  }
}

async function getPageBySlug(slug: string) {
  console.log('>>>>>>>>>getPageBySlug', slug);
  return await strapiApi.getPageBySlug(slug);
}

// Generate static params for all pages at build time
export async function generateStaticParams() {
  try {
    const pagesResponse = await strapiApi.getPages();
    return pagesResponse.data.map(page => ({
      slug: page.slug.split('/'), // Handle nested paths
    }));
  } catch (error) {
    console.error('Error generating static params for pages:', error);
    return [];
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const pageSlug = slug.join('/');

  const page = await getPageBySlug(pageSlug);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="prose prose-lg mx-auto">
        <h1 className="text-4xl font-bold mb-6">{page.title}</h1>

        {page.content && (
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        {/* Render dynamic components if any */}
        {page.components && page.components.map((component) => {
          switch (component.__component) {
            case 'basic.page':
              return (
                <div key={component.title} className="my-8">
                  <h2 className="text-2xl font-semibold mb-4">{component.title}</h2>
                  {component.content && (
                    <div
                      dangerouslySetInnerHTML={{ __html: component.content }}
                    />
                  )}
                </div>
              );
            default:
              return null;
          }
        })}
      </article>
    </div>
  );
}

// Revalidate every 60 seconds
export const revalidate = 60;
