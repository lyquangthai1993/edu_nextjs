import { NextResponse } from 'next/server';
import { strapiApi } from '@/libs/StrapiApi';

export async function GET() {
  try {
    console.log('🔍 Debug: Fetching all pages...');
    
    // Get all pages to see what's available
    const pagesResponse = await strapiApi.getPages();
    
    console.log('📊 All pages response:', JSON.stringify(pagesResponse, null, 2));
    
    const pages = pagesResponse.data || [];
    
    return NextResponse.json({
      message: 'Debug: All pages in Strapi',
      totalPages: pages.length,
      pages: pages.map((page: any) => ({
        id: page.id,
        documentId: page.documentId,
        title: page.title,
        slug: page.slug,
        hasFeaturedImage: !!page.featuredImage,
        featuredImageUrl: page.featuredImage?.url || null,
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Debug pages error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch pages for debugging', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}