import { NextResponse } from 'next/server';
import { cacheService } from '@/libs/CacheService';

export async function GET() {
  try {
    // Check cache health
    const healthCheck = await cacheService.healthCheck();

    return NextResponse.json({
      status: 'Cache Status Check',
      redis: healthCheck,
      endpoints: {
        invalidate: '/api/cache/invalidate (POST)',
        test: '/api/cache/test (GET)',
        status: '/api/cache/status (GET)',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Cache status check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
