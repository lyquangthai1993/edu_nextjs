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

class StrapiApiService {
  async getPosts(_params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, any>;
  }): Promise<PostsResponse> {
    const cacheKey = 'posts:all';
    
    return await cacheService.remember(
      cacheKey,
      async () => {
        try {
          const searchParams = new URLSearchParams();
          searchParams.append('populate', '*');

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
      { ttl: 300 } // 5 minutes cache
    );
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    const cacheKey = `post:${slug}`;
    
    return await cacheService.remember(
      cacheKey,
      async () => {
        try {
          const searchParams = new URLSearchParams();
          searchParams.append('filters[slug][$eq]', slug);
          searchParams.append('populate', '*');

          const response = await axiosInstance.get(`/posts?${searchParams.toString()}`);

          if (response.data.data.length === 0) {
            return null;
          }

          return response.data.data[0];
        } catch (error) {
          console.error('Error fetching post by slug:', error);
          return null;
        }
      },
      { ttl: 600 } // 10 minutes cache for individual posts
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
      { ttl: 900 } // 15 minutes cache for categories (they change less frequently)
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
      { ttl: 600 } // 10 minutes cache for featured posts
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
      { ttl: 600 } // 10 minutes cache for category posts
    );
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
