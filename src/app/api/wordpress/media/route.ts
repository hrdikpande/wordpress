import { NextRequest, NextResponse } from 'next/server';
import { loadWordPressSites, getSiteById } from '@/lib/config';

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

    const site = getSiteById(siteId);
    if (!site) {
      return NextResponse.json({
        success: false,
        error: 'Site not found'
      }, { status: 404 });
    }

    // Create Basic Auth header
    const authString = Buffer.from(`${site.credentials.username}:${site.credentials.password}`).toString('base64');

    // Fetch media from WordPress REST API
    const response = await fetch(`${site.apiUrl}/media?per_page=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WordPress-Management-App/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress media fetch error:', response.status, errorText);
      return NextResponse.json({
        success: false,
        error: `Failed to fetch media: ${response.status} ${response.statusText}`
      }, { status: response.status });
    }

    const mediaData = await response.json();
    
    // Transform WordPress media data to our format
    const media = mediaData.map((item: any) => ({
      id: item.id,
      url: item.source_url,
      alt_text: item.alt_text || '',
      title: item.title?.rendered || '',
      filename: item.media_details?.file || '',
      width: item.media_details?.width || 0,
      height: item.media_details?.height || 0,
      mime_type: item.mime_type || '',
      date: item.date || ''
    }));

    return NextResponse.json({
      success: true,
      data: media,
      message: `Found ${media.length} media items`
    });

  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch media'
    }, { status: 500 });
  }
} 