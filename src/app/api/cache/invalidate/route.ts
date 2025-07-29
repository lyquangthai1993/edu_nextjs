/* eslint-disable no-console */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { strapiApi } from '@/libs/StrapiApi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, contentType, slug, title, source } = body;

    console.log(`🗑️ Navigation cache invalidation triggered by ${contentType || 'unknown'} change`);
    console.log(`📄 Content: ${title || slug || 'unknown'} from ${source || 'unknown'}`);

    if (type === 'navigation') {
      const success = await strapiApi.invalidateNavigationCache('Navigation');

      if (success) {
        console.log(`✅ Successfully invalidated navigation cache`);
        return NextResponse.json({
          success: true,
          message: 'Navigation cache invalidated',
          trigger: { contentType, slug, title },
          timestamp: new Date().toISOString(),
        });
      } else {
        console.error(`❌ Failed to invalidate navigation cache`);
        return NextResponse.json(
          { error: 'Failed to invalidate navigation cache' },
          { status: 500 },
        );
      }
    } else {
      return NextResponse.json(
        { error: `This endpoint only handles navigation cache invalidation` },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('❌ Navigation cache invalidation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during navigation cache invalidation' },
      { status: 500 },
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({
    message: 'Navigation Cache Invalidation API',
    description: 'Automatically triggered when Posts/Pages change in Strapi',
    methods: ['POST'],
    usage: 'POST /api/cache/invalidate { "type": "navigation", "contentType": "post|page", "slug": "content-slug", "title": "Content Title" }',
  });
}
