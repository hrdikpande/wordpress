import { NextRequest, NextResponse } from 'next/server';
import { getSiteById } from '@/lib/config';

/**
 * API Route: Fetch Categories from WordPress Site
 * GET /api/wordpress/categories?siteId=site_1
 * 
 * Returns list of categories from the specified WordPress site
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json({
        success: false,
        error: 'Site ID is required'
      }, { status: 400 });
    }

    // Get real site configuration
    const site = getSiteById(siteId);
    if (!site) {
      return NextResponse.json({
        success: false,
        error: 'Site not found'
      }, { status: 404 });
    }

    // Validate site configuration
    if (!site.credentials.username || !site.credentials.password) {
      return NextResponse.json({
        success: false,
        error: 'Site credentials not configured'
      }, { status: 500 });
    }

    // Make real WordPress REST API call to fetch categories
    const authString = Buffer.from(`${site.credentials.username}:${site.credentials.password}`).toString('base64');
    
    const response = await fetch(`${site.apiUrl}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WordPress-Management-App/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress categories API error:', response.status, errorText);
      
      return NextResponse.json({
        success: false,
        error: `WordPress API error: ${response.status} - ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const categories = await response.json();
    
    // Transform WordPress API response to our format
    const formattedCategories = categories.map((category: {
      id: number;
      name: string;
      slug: string;
      description: string;
      count: number;
      link: string;
    }) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      count: category.count,
      link: category.link
    }));

    return NextResponse.json({
      success: true,
      data: formattedCategories,
      message: `Categories fetched from ${site.name}`,
      site: {
        id: site.id,
        name: site.name,
        url: site.url
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories'
    }, { status: 500 });
  }
} 