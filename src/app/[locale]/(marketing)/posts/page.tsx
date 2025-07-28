import type { PostsResponse } from '@/libs/StrapiApi';
import { setRequestLocale } from 'next-intl/server';
import { PostItem } from '@/components/PostItem';
import { strapiApi } from '@/libs/StrapiApi';

async function getPosts(): Promise<PostsResponse> {
  return await strapiApi.getPosts();
}

export default async function PostsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const postsData = await getPosts();
  const posts = postsData.data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Our</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Blog Posts
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Discover insights, tutorials, and stories from our team. Stay updated with the latest trends and best practices.
            </p>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {
          posts.length === 0
            ? (
                <div className="text-center py-16">
                  <div className="mx-auto h-24 w-24 text-gray-400">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      className="h-full w-full"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">No posts yet</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Check back soon for new content and updates!
                  </p>
                </div>
              )
            : (
                <>
                  {/* Stats */}
                  <div className="mb-8 text-center sm:text-left">
                    <p className="text-sm text-gray-600">
                      Showing
                      {' '}
                      <span className="font-medium text-gray-900">{posts.length}</span>
                      {' '}
                      of
                      {' '}
                      <span className="font-medium text-gray-900">{postsData.meta.pagination.total}</span>
                      {' '}
                      posts
                    </p>
                  </div>

                  {/* Posts Grid */}
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map(post => (
                      <PostItem key={post.id} post={post} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {postsData.meta.pagination.pageCount > 1 && (
                    <div className="mt-16 flex justify-center">
                      <div className="rounded-lg bg-white px-6 py-3 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm text-gray-600">
                          Page
                          {' '}
                          <span className="font-medium">{postsData.meta.pagination.page}</span>
                          {' '}
                          of
                          {' '}
                          <span className="font-medium">{postsData.meta.pagination.pageCount}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )
        }
      </div>
    </div>
  );
}
