import { NextResponse } from 'next/server';
import { getConfigSummary } from '@/lib/config';

/**
 * API Route: Configuration Status
 * GET /api/config/status
 * 
 * Returns configuration summary without sensitive data
 * Useful for debugging and health checks
 */
export async function GET() {
  try {
    const configSummary = getConfigSummary();
    
    return NextResponse.json({
      success: true,
      data: configSummary,
      message: 'Configuration loaded successfully'
    });
  } catch (error) {
    console.error('Configuration error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown configuration error',
      data: {
        sitesCount: 0,
        sites: [],
        rateLimit: null,
        jwtConfigured: false,
        encryptionConfigured: false
      }
    }, { status: 500 });
  }
} 