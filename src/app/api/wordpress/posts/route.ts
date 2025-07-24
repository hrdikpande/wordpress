import { NextRequest, NextResponse } from 'next/server';
import { WordPressPost } from '@/types/wordpress';
import { getSiteById } from '@/lib/config';

/**
 * API Route: Create New Post on WordPress Site
 * POST /api/wordpress/posts
 * 
 * Accepts JSON data with post details
 * Returns the created post information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      siteId,
      authorId,
      title,
      content,
      featuredImageId,
      template,
      categories = [],
      status = 'draft'
    } = body;

    // Validate required fields
    if (!siteId || !authorId || !title || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: siteId, authorId, title, content'
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

    // Prepare post data for WordPress API
    const postData: any = {
      title: title,
      content: content,
      status: status,
      author: parseInt(authorId),
      featured_media: featuredImageId || 0,
      categories: categories
    };

    // Only add template if it's a valid WordPress template (not "default")
    if (template && template !== "default" && ['elementor_canvas', 'elementor_header_footer', 'elementor_theme'].includes(template)) {
      postData.template = template;
    }

    // Add meta data separately to avoid template conflicts
    const metaData = {
      template: template || 'standard',
      created_via: 'wordpress-management-app',
      site_id: site.id
    };

    console.log('Sending post data to WordPress:', postData);

    // Make real WordPress REST API call to create post
    const authString = Buffer.from(`${site.credentials.username}:${site.credentials.password}`).toString('base64');
    
    const response = await fetch(`${site.apiUrl}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WordPress-Management-App/1.0'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress post creation error:', response.status, errorText);
      
      let errorMessage = `WordPress post creation error: ${response.status} - ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = `WordPress API Error: ${errorData.message}`;
        }
        if (errorData.data && errorData.data.params) {
          const paramErrors = Object.entries(errorData.data.params)
            .map(([param, details]: [string, any]) => `${param}: ${details.message}`)
            .join(', ');
          errorMessage += ` (${paramErrors})`;
        }
      } catch (parseError) {
        // If we can't parse the error, use the raw text
        errorMessage = `WordPress API Error: ${errorText}`;
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: errorText
      }, { status: response.status });
    }

    const postResponse = await response.json();

    // Add meta data to the post after creation
    try {
      const metaResponse = await fetch(`${site.apiUrl}/posts/${postResponse.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
          'User-Agent': 'WordPress-Management-App/1.0'
        },
        body: JSON.stringify({
          meta: metaData
        })
      });
      
      if (!metaResponse.ok) {
        console.warn('Failed to add meta data to post:', metaResponse.status);
      }
    } catch (metaError) {
      console.warn('Error adding meta data to post:', metaError);
    }

    // Transform WordPress API response to our format
    const createdPost: WordPressPost = {
      id: postResponse.id,
      date: postResponse.date,
      date_gmt: postResponse.date_gmt,
      guid: postResponse.guid,
      modified: postResponse.modified,
      modified_gmt: postResponse.modified_gmt,
      slug: postResponse.slug,
      status: postResponse.status,
      type: postResponse.type,
      link: postResponse.link,
      title: postResponse.title,
      content: postResponse.content,
      excerpt: postResponse.excerpt,
      author: postResponse.author,
      featured_media: postResponse.featured_media,
      comment_status: postResponse.comment_status,
      ping_status: postResponse.ping_status,
      sticky: postResponse.sticky,
      template: postResponse.template,
      format: postResponse.format,
      meta: postResponse.meta,
      categories: postResponse.categories,
      tags: postResponse.tags
    };

    return NextResponse.json({
      success: true,
      data: createdPost,
      message: `Post "${title}" created on ${site.name}`,
      post_url: createdPost.link,
      site: {
        id: site.id,
        name: site.name,
        url: site.url
      }
    });

  } catch (error) {
    console.error('Error creating post:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create post'
    }, { status: 500 });
  }
} 