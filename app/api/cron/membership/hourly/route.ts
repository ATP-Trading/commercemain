import { NextRequest, NextResponse } from 'next/server';
import { cronHandlers } from '../../../../../lib/services/membership-cron-service';

/**
 * Hourly cron job endpoint for membership lifecycle management
 * This endpoint should be called every hour by your cron system
 * 
 * Example cron schedule: 0 * * * * (every hour)
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Hourly membership cron job triggered');
    const result = await cronHandlers.hourly();

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    });

  } catch (error) {
    console.error('Error in hourly cron job:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}