import { NextRequest, NextResponse } from 'next/server';
import { membershipMonitoring } from '@/lib/monitoring/membership-monitoring';

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const healthReport = membershipMonitoring.generateHealthReport();
    
    // Set appropriate HTTP status based on health
    let status = 200;
    if (healthReport.status === 'warning') {
      status = 200; // Still OK, but with warnings
    } else if (healthReport.status === 'critical') {
      status = 503; // Service unavailable
    }

    return NextResponse.json(healthReport, { status });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'critical',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { action } = await request.json();
    
    if (action === 'clear-alerts') {
      membershipMonitoring.clearOldAlerts(24);
      return NextResponse.json({ message: 'Old alerts cleared' });
    }
    
    if (action === 'reset-metrics') {
      // Only allow in development
      if (process.env.NODE_ENV === 'development') {
        membershipMonitoring.resetMetrics();
        return NextResponse.json({ message: 'Metrics reset' });
      } else {
        return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Health endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}