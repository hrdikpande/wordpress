import { NextRequest, NextResponse } from 'next/server';
import { getSiteById } from '@/lib/config';

/**
 * API Route: Upload Image to WordPress Site
 * POST /api/wordpress/upload
 * 
 * Accepts multipart form data with siteId and image file
 * Returns the uploaded image URL
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const siteId = formData.get('siteId') as string;
    const file = formData.get('file') as File;

    if (!siteId) {
      return NextResponse.json({
        success: false,
        error: 'Site ID is required'
      }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Image file is required'
      }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'File must be an image'
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

    // Convert file to buffer for upload
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Create multipart form data for WordPress media upload
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    
    // Add file data
    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file.name}"\r\nContent-Type: ${file.type}\r\n\r\n`;
    const fileFooter = `\r\n--${boundary}--\r\n`;
    
    const formDataWithFile = Buffer.concat([
      Buffer.from(fileHeader, 'utf8'),
      fileBuffer,
      Buffer.from(fileFooter, 'utf8')
    ]);

    // Make real WordPress REST API call to upload media
    const authString = Buffer.from(`${site.credentials.username}:${site.credentials.password}`).toString('base64');
    
    const response = await fetch(`${site.apiUrl}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'User-Agent': 'WordPress-Management-App/1.0'
      },
      body: formDataWithFile
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress media upload error:', response.status, errorText);
      
      return NextResponse.json({
        success: false,
        error: `WordPress media upload error: ${response.status} - ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const mediaData = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        id: mediaData.id,
        url: mediaData.source_url,
        alt_text: mediaData.alt_text || '',
        title: mediaData.title?.rendered || file.name,
        caption: mediaData.caption?.rendered || '',
        description: mediaData.description?.rendered || '',
        media_type: mediaData.media_type,
        mime_type: mediaData.mime_type,
        source_url: mediaData.source_url,
        sizes: mediaData.media_details?.sizes || {}
      },
      message: `Image uploaded to ${site.name}`,
      site: {
        id: site.id,
        name: site.name,
        url: site.url
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image'
    }, { status: 500 });
  }
} 