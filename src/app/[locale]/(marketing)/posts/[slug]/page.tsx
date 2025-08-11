/* eslint-disable no-console */
import type { Metadata } from 'next';
import type { Post } from '@/libs/StrapiApi';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Link } from '@/libs/I18nNavigation';
import { strapiApi } from '@/libs/StrapiApi';
import { formatStatus, getStatusColors } from '@/utils/PostHelpers';

type PostPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

async function getPost(slug: string, locale: string = 'en'): Promise<Post | null> {
  return await strapiApi.getPostBySlug(slug, locale);
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug, locale);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt || `Read ${post.title} - A blog post about ${post.title.toLowerCase()}`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Read ${post.title}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || `Read ${post.title}`,
    },
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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

export default async function PostDetailPage({ params }: PostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getPost(slug, locale);
  console.log(
    '>>>>>>>>>>>>>POST CONTENT<<<<<<<<<<<<\n',
    JSON.stringify(post, null, 2),
    '\n>>>>>>>>>>>>>POST CONTENT<<<<<<<<<<<<\n',
  );

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4">
      <div className="mb-8">
        <Link
          href="/posts"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Posts
        </Link>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-sm ${getStatusColors(post.post_status).background} ${getStatusColors(post.post_status).text}`}>
            {formatStatus(post.post_status)}
          </span>
          {post.isFeatured && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              Featured
            </span>
          )}
        </div>

        <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mb-6 text-xl text-gray-600 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <time dateTime={post.publishedAt}>
              Published
              {' '}
              {formatDate(post.publishedAt)}
            </time>
            {post.readingTime > 0 && (
              <>
                <span>•</span>
                <span>
                  {post.readingTime}
                  {' '}
                  min read
                </span>
              </>
            )}
            <span>•</span>
            <span>
              {post.viewCount}
              {' '}
              views
            </span>
          </div>
        </div>
      </div>

      {post.featuredImage && (
        <div className="relative mb-8 h-96 w-full overflow-hidden rounded-lg">
          <Image
            src={strapiApi.getImageUrl(post.featuredImage.url)}
            alt={post.featuredImage.alternativeText || post.title}
            fill
            className="object-contain"
            priority
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <div className="text-gray-800 leading-relaxed">
          {Array.isArray(post.content)
            ? (
                <BlocksRenderer content={post.content} blocks={blocksConfig} />
              )
            : (
                // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              )}
        </div>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                #
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 border-t border-gray-200 pt-8">
        <div className="rounded-lg bg-gray-50 p-6">
          <p className="text-center text-gray-600">
            This post was published on
            {' '}
            <time dateTime={post.publishedAt} className="font-medium">
              {formatDate(post.publishedAt)}
            </time>
            {post.updatedAt !== post.createdAt && (
              <>
                {' '}
                and last updated on
                {' '}
                <time dateTime={post.updatedAt} className="font-medium">
                  {formatDate(post.updatedAt)}
                </time>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/posts"
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
        >
          View All Posts
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}

// Generate static params for all posts at build time
export async function generateStaticParams() {
  try {
    const locales = ['en', 'vi']; // Add your supported locales here
    const allParams: { locale: string; slug: string }[] = [];

    for (const locale of locales) {
      const postsResponse = await strapiApi.getPosts({ locale });
      const localeParams = postsResponse.data.map((post: Post) => ({
        locale,
        slug: post.slug,
      }));
      allParams.push(...localeParams);
    }

    return allParams;
  } catch (error) {
    console.error('Error generating static params for posts:', error);
    return [];
  }
}

export const revalidate = 60;
