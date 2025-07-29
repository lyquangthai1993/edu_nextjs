import { NextResponse } from 'next/server';
import { strapiApi } from '@/libs/StrapiApi';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get('post') || 'bai-viet-1'; // Default post slug
    const pageSlug = searchParams.get('page') || 've-chung-toi-1222'; // Default page slug
    
    console.log(`🔍 Comparing API calls:`);
    console.log(`📄 Post slug: ${postSlug}`);
    console.log(`📄 Page slug: ${pageSlug}`);
    
    // Test both APIs
    const [post, page] = await Promise.all([
      strapiApi.getPostBySlug(postSlug),
      strapiApi.getPageBySlug(pageSlug)
    ]);
    
    return NextResponse.json({
      message: 'API Comparison',
      postSlug,
      pageSlug,
      results: {
        post: {
          found: !!post,
          title: post?.title || null,
          hasFeaturedImage: !!post?.featuredImage,
          featuredImageUrl: post?.featuredImage?.url || null,
        },
        page: {
          found: !!page,
          title: page?.title || null,
          hasFeaturedImage: !!page?.featuredImage,
          featuredImageUrl: page?.featuredImage?.url || null,
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Comparison error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to compare APIs', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}