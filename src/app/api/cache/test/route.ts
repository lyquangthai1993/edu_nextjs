import { NextResponse } from 'next/server';
import { strapiApi } from '@/libs/StrapiApi';

export async function GET() {
  try {
    // Test navigation cache invalidation only
    const success = await strapiApi.invalidateNavigationCache('Navigation');

    return NextResponse.json({
      message: 'Navigation cache invalidation test',
      result: success ? 'success' : 'failed',
      description: 'This simulates what happens when you update a Post/Page in Strapi',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Navigation cache test error:', error);
    return NextResponse.json(
      { error: 'Navigation cache test failed', details: error },
      { status: 500 },
    );
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'Use GET method to test navigation cache invalidation',
  });
}
