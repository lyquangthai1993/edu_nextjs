/* eslint-disable no-console */
import type { Metadata } from 'next';
import Image from 'next/image';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import { strapiApi } from '@/libs/StrapiApi';

type PageProps = {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const pageSlug = slug.join('/');

  try {
    const page = await getPageBySlug(pageSlug, locale);

    if (!page) {
      return {
        title: 'Page Not Found',
      };
    }

    const metadata: Metadata = {
      title: page.seo?.metaTitle || page.title,
      description: page.seo?.metaDescription || page.excerpt,
      keywords: page.seo?.keywords,
      robots: page.seo?.metaRobots,
    };

    // Add featured image to metadata if available
    if (page.featuredImage) {
      metadata.openGraph = {
        title: page.seo?.metaTitle || page.title,
        description: page.seo?.metaDescription || page.excerpt,
        images: [
          {
            url: strapiApi.getImageUrl(page.featuredImage.url),
            width: page.featuredImage.width,
            height: page.featuredImage.height,
            alt: page.featuredImage.alternativeText || page.title,
          },
        ],
      };

      metadata.twitter = {
        card: 'summary_large_image',
        title: page.seo?.metaTitle || page.title,
        description: page.seo?.metaDescription || page.excerpt,
        images: [strapiApi.getImageUrl(page.featuredImage.url)],
      };
    }

    return metadata;
  } catch (error) {
    console.error(error);
    return {
      title: 'Page Not Found',
    };
  }
}

async function getPageBySlug(slug: string, locale: string = 'en') {
  console.log('>>>>>>>>>getPageBySlug INPUT:', slug, 'LOCALE:', locale);
  try {
    const result = await strapiApi.getPageBySlug(slug, locale);
    // console.log('>>>>>>>>>getPageBySlug RESULT:');
    // console.log('- Has result:', !!result);
    // console.log('- Title:', result?.title);
    // console.log('- FeaturedImage exists:', !!result?.featuredImage);
    // console.log('- FeaturedImage URL:', result?.featuredImage?.url);
    // console.log('- Full featuredImage object:', JSON.stringify(result?.featuredImage, null, 2));
    return result;
  } catch (error) {
    console.error('>>>>>>>>>getPageBySlug ERROR:', error);
    return null;
  }
}

// Custom components for blocks renderer
const blocksConfig = {
  image: ({ image }: any) => {
    return (
      <div className="my-8">
        <Image
          src={strapiApi.getImageUrl(image.url)}
          alt={image.alternativeText || ''}
          width={image.width}
          height={image.height}
          className="rounded-lg mx-auto"
        />
        {image.caption && (
          <p className="text-center text-sm text-gray-600 mt-2 italic">
            {image.caption}
          </p>
        )}
      </div>
    );
  },
};

// Generate static params for all pages at build time
export async function generateStaticParams() {
  try {
    const locales = ['en', 'vi']; // Add your supported locales here
    const allParams: { locale: string; slug: string[] }[] = [];
    
    for (const locale of locales) {
      const pagesResponse = await strapiApi.getPages({ locale });
      const localeParams = pagesResponse.data.map(page => ({
        locale,
        slug: page.slug.split('/'), // Handle nested paths
      }));
      allParams.push(...localeParams);
    }
    
    return allParams;
  } catch (error) {
    console.error('Error generating static params for pages:', error);
    return [];
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const pageSlug = slug.join('/');

  const page = await getPageBySlug(pageSlug, locale);
  if (!page) {
    return (
      <div className="container mx-auto px-4 py-8">
        <article className="prose prose-lg mx-auto">
          <h1 className="text-4xl font-bold mb-6">Page Not Found</h1>
        </article>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <article className="prose prose-lg mx-auto">
        <h1 className="text-4xl font-bold mb-6">{page.title}</h1>

        {page.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            {page.excerpt}
          </p>
        )}

        {page.featuredImage && (
          <div className="relative mb-8 h-96 w-full overflow-hidden rounded-lg">
            <Image
              src={strapiApi.getImageUrl(page.featuredImage.url)}
              alt={page.featuredImage.alternativeText || page.title}
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {page.content && (
          <div className="content">
            {Array.isArray(page.content) ? (
              <BlocksRenderer content={page.content} blocks={blocksConfig} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            )}
          </div>
        )}

        {/* Render dynamic components if any */}
        {page.components && page.components.map((component) => {
          switch (component.__component) {
            case 'basic.page':
              return (
                <div key={component.title} className="my-8">
                  <h2 className="text-2xl font-semibold mb-4">{component.title}</h2>
                  {component.content && (
                    <div>
                      <BlocksRenderer content={component.content} blocks={blocksConfig} />
                    </div>
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
