import { AppConfig } from '@/utils/AppConfig';
import axiosInstance from './Axios';
import { cacheService } from './CacheService';

export type Post = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  featuredImage?: {
    id: number;
    documentId: string;
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: {
      small?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      thumbnail?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    provider: string;
    provider_metadata?: any;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  author?: {
    username: string;
  };
  categories?: Array<{
    name: string;
    slug: string;
  }>;
  tags: string[];
  post_status?: 'draft' | 'published' | 'archived';
  viewCount: number;
  readingTime: number;
  isFeatured: boolean;
};

export type PostsResponse = {
  data: Post[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type Category = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoriesResponse = {
  data: Category[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type Page = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  featuredImage?: {
    id: number;
    documentId: string;
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: {
      small?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      thumbnail?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path?: string;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    provider: string;
    provider_metadata?: any;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    metaRobots?: string;
    canonicalURL?: string;
    structuredData?: any;
  };
  components?: Array<{
    __component: string;
    [key: string]: any;
  }>;
  isHomepage?: boolean;
  parentPage?: Page;
  childPages?: Page[];
};

export type PagesResponse = {
  data: Page[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

class StrapiApiService {
  async getPosts(params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, any>;
    locale?: string;
  }): Promise<PostsResponse> {
    const cacheKey = `posts:${params?.locale || 'en'}:all`;

    return await cacheService.remember(
      cacheKey,
      async () => {
        try {
          const searchParams = new URLSearchParams();
          searchParams.append('populate', '*');
          if (params?.locale) {
            searchParams.append('locale', params.locale);
          }

          const response = await axiosInstance.get(`/posts?${searchParams.toString()}`);
          return response.data;
        } catch (error) {
          console.error('Error fetching posts:', error);
          return {
            data: [],
            meta: {
              pagination: {
                page: 1,
                pageSize: 25,
                pageCount: 0,
                total: 0,
              },
            },
          };
        }
      },
      { ttl: 60 }, // 5 minutes cache
    );
  }

  async getPostBySlug(slug: string, locale: string = 'en'): Promise<Post | null> {
    const cacheKey = `post:${locale}:${slug}`;

    return await cacheService.remember(
      cacheKey,
      async () => {
        try {
          const searchParams = new URLSearchParams();
          searchParams.append('filters[slug][$eq]', slug);
          searchParams.append('populate', '*');
          searchParams.append('locale', locale);

          const response = await axiosInstance.get(`/posts?${searchParams.toString()}`);
          console.log('url request post slug', `/posts?${searchParams.toString()}`);
          if (!response?.data) {
            return null;
          }
          if (response?.data?.data?.length === 0) {
            return null;
          }

          return response?.data?.data ? response?.data?.data[0] : null;
        } catch (error) {
          console.error('Error fetching post by slug:', error);
          return null;
        }
      },
      { ttl: 60 }, // 10 minutes cache for individual posts
    );
  }

  async getCategories(): Promise<CategoriesResponse> {
    const cacheKey = 'categories:all';

    return await cacheService.remember(
      cacheKey,
      async () => {
        try {
          const response = await axiosInstance.get('/categories');
          return response.data;
        } catch (error) {
          console.error('Error fetching categories:', error);
          return {
            data: [],
            meta: {
              pagination: {
                page: 1,
                pageSize: 25,
                pageCount: 0,
                total: 0,
              },
            },
          };
        }
      },
      { ttl: 60 }, // 15 minutes cache for categories (they change less frequently)
    );
  }

  async getFeaturedPosts(): Promise<PostsResponse> {
    const cacheKey = 'posts:featured';

    return await cacheService.remember(
      cacheKey,
      async () => {
        try {
          const searchParams = new URLSearchParams();
          searchParams.append('filters[isFeatured][$eq]', 'true');
          searchParams.append('populate', '*');
          searchParams.append('sort', 'publishedAt:desc');

          const response = await axiosInstance.get(`/posts?${searchParams.toString()}`);
          return response.data;
        } catch (error) {
          console.error('Error fetching featured posts:', error);
          return {
            data: [],
            meta: {
              pagination: {
                page: 1,
                pageSize: 25,
                pageCount: 0,
                total: 0,
              },
            },
          };
        }
      },
      { ttl: 60 }, // 10 minutes cache for featured posts
    );
  }

  async getPostsByCategory(categorySlug: string): Promise<PostsResponse> {
    const cacheKey = `posts:category:${categorySlug}`;

    return await cacheService.remember(
      cacheKey,
      async () => {
        try {
          const searchParams = new URLSearchParams();
          searchParams.append('filters[categories][slug][$eq]', categorySlug);
          searchParams.append('populate', '*');
          searchParams.append('sort', 'publishedAt:desc');

          const response = await axiosInstance.get(`/posts?${searchParams.toString()}`);
          return response.data;
        } catch (error) {
          console.error('Error fetching posts by category:', error);
          return {
            data: [],
            meta: {
              pagination: {
                page: 1,
                pageSize: 25,
                pageCount: 0,
                total: 0,
              },
            },
          };
        }
      },
      { ttl: 60 }, // 10 minutes cache for category posts
    );
  }

  async getPages(params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, any>;
    locale?: string;
  }): Promise<PagesResponse> {
    const cacheKey = `pages:${params?.locale || 'en'}:${params?.page || 'all'}`;
    console.info('Fetching pages:', cacheKey);
    return await cacheService.remember(
      cacheKey,
      async () => {
        try {
          const searchParams = new URLSearchParams();
          searchParams.append('populate', '*');
          if (params?.locale) {
            searchParams.append('locale', params.locale);
          }

          const response = await axiosInstance.get(`/pages?${searchParams.toString()}`);
          return response.data;
        } catch (error) {
          console.error('Error fetching pages:', error);
          return {
            data: [],
            meta: {
              pagination: {
                page: 1,
                pageSize: 25,
                pageCount: 0,
                total: 0,
              },
            },
          };
        }
      },
      { ttl: 60 * 10 }, // 10 minutes cache
    );
  }

  async getPageBySlug(slug: string, locale: string = 'en'): Promise<Page | null> {
    const cacheKey = `page:${locale}:${slug}`;

    return await cacheService.remember(
      cacheKey,
      async () => {
        try {
          const searchParams = new URLSearchParams();
          searchParams.append('filters[slug][$eq]', slug);
          searchParams.append('populate', '*');
          searchParams.append('locale', locale);

          const response = await axiosInstance.get(`/pages?${searchParams.toString()}`);

          console.log(`🔍 API URL: /pages?${searchParams.toString()}`);
          console.log(`📊 Response:`, response.data);

          if (response.data.data.length === 0) {
            return null;
          }

          return response.data.data[0];
        } catch (error) {
          console.error('Error fetching page by slug:', error);
          return null;
        }
      },
      { ttl: 60 }, // 30 minutes cache for pages (they change less frequently than posts)
    );
  }

  async getHomepage(locale: string = 'en'): Promise<Page | null> {
    const cacheKey = `page:${locale}:homepage`;

    return await cacheService.remember(
      cacheKey,
      async () => {
        try {
          const searchParams = new URLSearchParams();
          searchParams.append('filters[isHomepage][$eq]', 'true');
          searchParams.append('populate[featuredImage]', '*');
          searchParams.append('populate[seo]', '*');
          searchParams.append('populate[components]', '*');
          searchParams.append('locale', locale);

          const response = await axiosInstance.get(`/pages?${searchParams.toString()}`);

          if (response.data.data.length === 0) {
            return null;
          }

          return response.data.data[0];
        } catch (error) {
          console.error('Error fetching homepage:', error);
          return null;
        }
      },
      { ttl: 60 }, // 30 minutes cache for homepage
    );
  }

  async getNavigation(name: string = 'main', locale: string = 'en'): Promise<any> {
    const cacheKey = `navigation:${name}:${locale}`;

    return await cacheService.remember(
      cacheKey,
      async () => {
        try {
          // Try to fetch navigation for the requested locale
          const response = await axiosInstance.get(`/navigation/render/${name}?type=TREE&populate=*&locale=${locale}`);

          // If we got data, return it
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return response.data;
          }

          // If no data and not using default locale, try default locale
          if (locale !== AppConfig.defaultLocale) {
            console.info(`No navigation data for locale '${locale}', trying default locale '${AppConfig.defaultLocale}'`);
            const fallbackResponse = await axiosInstance.get(`/navigation/render/${name}?type=TREE&populate=*&locale=${AppConfig.defaultLocale}`);

            if (fallbackResponse.data && Array.isArray(fallbackResponse.data) && fallbackResponse.data.length > 0) {
              return fallbackResponse.data;
            }
          }

          // If still no data, return empty array
          return [];
        } catch (error) {
          console.error('Error fetching navigation:', error);

          // If we failed to fetch for the requested locale and it's not the default locale, try default locale
          if (locale !== AppConfig.defaultLocale) {
            try {
              console.log(`Failed to fetch navigation for locale '${locale}', trying default locale '${AppConfig.defaultLocale}'`);
              const fallbackResponse = await axiosInstance.get(`/navigation/render/${name}?type=TREE&populate=*&locale=${AppConfig.defaultLocale}`);

              if (fallbackResponse.data && Array.isArray(fallbackResponse.data) && fallbackResponse.data.length > 0) {
                return fallbackResponse.data;
              }
            } catch (fallbackError) {
              console.error('Error fetching navigation with default locale:', fallbackError);
            }
          }

          return [];
        }
      },
      { ttl: 60 * 2 }, // 2 minutes cache for navigation (faster updates)
    );
  }

  // Cache invalidation methods
  async invalidateNavigationCache(navigationName: string = 'Navigation', locale?: string): Promise<boolean> {
    if (locale) {
      const cacheKey = `navigation:${navigationName}:${locale}`;
      return await cacheService.delete(cacheKey);
    } else {
      // Invalidate all locales for this navigation
      return await cacheService.deletePattern(`navigation:${navigationName}:*`);
    }
  }

  async invalidatePostCache(slug: string): Promise<boolean> {
    const cacheKey = `post:${slug}`;
    return await cacheService.delete(cacheKey);
  }

  async invalidatePageCache(slug: string): Promise<boolean> {
    const cacheKey = `page:${slug}`;
    return await cacheService.delete(cacheKey);
  }

  async invalidateAllPosts(): Promise<boolean> {
    return await cacheService.deletePattern('posts:*');
  }

  async invalidateAllPages(): Promise<boolean> {
    return await cacheService.deletePattern('pages:*');
  }

  getImageUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_HOST?.replace('/api', '') || 'http://localhost:1337';
    return `${strapiBaseUrl}${url}`;
  }
}

export const strapiApi = new StrapiApiService();
export const StrapiApi = strapiApi;
