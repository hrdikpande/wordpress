import { NextResponse } from 'next/server';
import { loadWordPressSites } from '@/lib/config';

/**
 * API Route: Get WordPress Sites List
 * GET /api/wordpress/sites
 * 
 * Returns list of configured WordPress sites
 */
export async function GET() {
  try {
    const sites = loadWordPressSites();
    
    // Return only non-sensitive data
    const siteList = sites.map(site => ({
      id: site.id,
      name: site.name,
      url: site.url
    }));

    return NextResponse.json({
      success: true,
      data: siteList,
      message: `Found ${siteList.length} WordPress sites`
    });

  } catch (error) {
    console.error('Error loading sites:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load sites'
    }, { status: 500 });
  }
} 