import { NextRequest, NextResponse } from 'next/server';
import { WordPressUser } from '@/types/wordpress';
import { getSiteById } from '@/lib/config';

/**
 * API Route: Fetch Authors from WordPress Site
 * GET /api/wordpress/authors?siteId=site_1
 * 
 * Returns list of authors from the specified WordPress site
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

    // Make real WordPress REST API call to fetch users
    const authString = Buffer.from(`${site.credentials.username}:${site.credentials.password}`).toString('base64');
    
    const response = await fetch(`${site.apiUrl}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WordPress-Management-App/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress API error:', response.status, errorText);
      
      return NextResponse.json({
        success: false,
        error: `WordPress API error: ${response.status} - ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const users = await response.json();
    
    // Transform WordPress API response to our format
    const authors: WordPressUser[] = users.map((user: {
      id: number;
      username: string;
      name: string;
      first_name: string;
      last_name: string;
      email: string;
      url: string;
      description: string;
      link: string;
      locale: string;
      nickname: string;
      slug: string;
      roles: string[];
      capabilities: Record<string, boolean>;
      extra_capabilities: Record<string, boolean>;
      avatar_urls: Record<string, string>;
      meta: Record<string, unknown>;
    }) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      url: user.url,
      description: user.description,
      link: user.link,
      locale: user.locale,
      nickname: user.nickname,
      slug: user.slug,
      roles: user.roles,
      capabilities: user.capabilities,
      extra_capabilities: user.extra_capabilities,
      avatar_urls: user.avatar_urls,
      meta: user.meta
    }));

    return NextResponse.json({
      success: true,
      data: authors,
      message: `Authors fetched from ${site.name}`,
      site: {
        id: site.id,
        name: site.name,
        url: site.url
      }
    });

  } catch (error) {
    console.error('Error fetching authors:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch authors'
    }, { status: 500 });
  }
} 