import type { Post } from '@/libs/StrapiApi';
import Image from 'next/image';
import { Link } from '@/libs/I18nNavigation';
import { strapiApi } from '@/libs/StrapiApi';
import { formatStatus, getStatusColors } from '@/utils/PostHelpers';

type PostItemProps = {
  post: Post;
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 24) {
    return diffInHours === 0 ? 'Just now' : `${diffInHours}h ago`;
  } else if (diffInHours < 24 * 7) {
    const days = Math.floor(diffInHours / 24);
    return `${days}d ago`;
  } else {
    return formatDate(dateString);
  }
}

export function PostItem({ post }: PostItemProps) {
  return (
    <article
      key={post.id}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-200 hover:shadow-lg hover:ring-gray-300"
    >
      <Link href={`/posts/${post.slug}`}>
        {/* Featured Image */}
        <div className="relative h-[200px] overflow-hidden m-4">
          {post.isFeatured && (
            <span className="absolute right-1 top-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              ⭐ Featured
            </span>
          )}

          {post.featuredImage
            ? (
                <Image
                  src={strapiApi.getImageUrl(post.featuredImage.url)}
                  alt={post.featuredImage.alternativeText || post.title}
                  fill
                  className="absolute inset-0 object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )
            : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 text-blue-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="mt-2 text-xs text-blue-500">No image</p>
                  </div>
                </div>
              )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          {/* Status and Featured Badges */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColors(post.post_status).background} ${getStatusColors(post.post_status).text}`}>
              {formatStatus(post.post_status)}
            </span>

          </div>

          {/* Title */}
          <h2 className="mb-3 flex-1">
            <Link
              href={`/posts/${post.slug}`}
              className="text-xl font-semibold leading-tight text-gray-900 transition-colors group-hover:text-blue-600"
            >
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h2>

          {/* Excerpt */}

          <p className="mb-4 text-sm text-gray-600 line-clamp-3 leading-relaxed min-h-[70px]">
            {post.excerpt ?? ''}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <time dateTime={post.publishedAt} className="flex items-center">
                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatRelativeTime(post.publishedAt)}
              </time>
              {post.readingTime > 0 && (
                <span className="flex items-center">
                  <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  {post.readingTime}
                  {' '}
                  min read
                </span>
              )}
            </div>
            {post.viewCount > 0 && (
              <span className="flex items-center">
                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {post.viewCount}
                {' '}
                views
              </span>
            )}
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    </article>
  );
}
