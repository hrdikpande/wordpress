"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Site {
  id: string;
  name: string;
  url: string;
}

interface Author {
  id: number;
  name: string;
  email: string;
}

interface PostTemplate {
  id: string;
  name: string;
  description: string;
}

interface UploadedImage {
  id: number;
  url: string;
  alt_text: string;
  title: string;
  filename?: string;
  width?: number;
  height?: number;
  mime_type?: string;
  date?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export default function NewPostPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingInlineImage, setIsUploadingInlineImage] = useState(false);
  const [inlineUploadProgress, setInlineUploadProgress] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<UploadedImage[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  // Hidden file input ref for inline image uploads
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  // Function to convert markdown to HTML for preview
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded my-2" />') // Images
      .replace(/\n/g, '<br />'); // Line breaks
  };

  // WordPress-compatible post templates
  const postTemplates: PostTemplate[] = [
    { id: "default", name: "Default Template", description: "Standard WordPress template" },
    { id: "elementor_canvas", name: "Elementor Canvas", description: "Full-width Elementor template" },
    { id: "elementor_header_footer", name: "Elementor Header & Footer", description: "Elementor with theme header/footer" },
    { id: "elementor_theme", name: "Elementor Theme", description: "Elementor with theme styling" },
  ];

  // Load media library from selected site
  const loadMediaLibrary = async (siteId: string) => {
    if (!siteId) return;
    
    setIsLoadingMedia(true);
    try {
      const response = await fetch(`/api/wordpress/media?siteId=${siteId}`);
      const result = await response.json();
      
      if (result.success) {
        setMediaLibrary(result.data);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to load media library' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load media library' });
    } finally {
      setIsLoadingMedia(false);
    }
  };

  // Load sites from API
  useEffect(() => {
    const loadSites = async () => {
      try {
        console.log('Loading sites from API...');
        const response = await fetch('/api/wordpress/sites');
        const result = await response.json();
        console.log('Sites API result:', result);
        
        if (result.success) {
          setSites(result.data);
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to load sites' });
          setSites([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load sites';
        console.error('Error loading sites:', err);
        setMessage({ type: 'error', text: errorMessage });
        setSites([]);
      }
    };
    
    loadSites();
  }, []);

  // Fetch authors from API
  const fetchAuthors = async (siteId: string) => {
    console.log('Fetching authors for site:', siteId);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wordpress/authors?siteId=${siteId}`);
      console.log('Authors API response status:', response.status);
      const result = await response.json();
      console.log('Authors API result:', result);
      
      if (result.success) {
        setAuthors(result.data);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to fetch authors' });
        setAuthors([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch authors';
      console.error('Error fetching authors:', err);
      setMessage({ type: 'error', text: errorMessage });
      setAuthors([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async (siteId: string) => {
    console.log('Fetching categories for site:', siteId);
    try {
      const response = await fetch(`/api/wordpress/categories?siteId=${siteId}`);
      console.log('Categories API response status:', response.status);
      const result = await response.json();
      console.log('Categories API result:', result);
      
      if (result.success) {
        setCategories(result.data);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to fetch categories' });
        setCategories([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      console.error('Error fetching categories:', err);
      setMessage({ type: 'error', text: errorMessage });
      setCategories([]);
    }
  };

  useEffect(() => {
    if (selectedSite) {
      fetchAuthors(selectedSite);
      fetchCategories(selectedSite);
      setSelectedAuthor(""); // Reset author when site changes
      setSelectedCategories([]); // Reset categories when site changes
      loadMediaLibrary(selectedSite); // Load media library when site changes
    } else {
      setAuthors([]);
      setCategories([]);
      setMediaLibrary([]); // Clear media library when no site is selected
    }
  }, [selectedSite]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedSite) {
      setIsUploading(true);
      setUploadProgress(0);
      setMessage(null);

      try {
        const formData = new FormData();
        formData.append('siteId', selectedSite);
        formData.append('file', file);

        // Use XMLHttpRequest to track progress
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              if (result.success) {
                setUploadedImage({
                  id: result.data.id,
                  url: result.data.url,
                  alt_text: result.data.alt_text || file.name,
                  title: result.data.title || file.name,
                  filename: file.name
                });
                // Add to media library
                setMediaLibrary(prev => [...prev, {
                  id: result.data.id,
                  url: result.data.url,
                  alt_text: result.data.alt_text || file.name,
                  title: result.data.title || file.name,
                  filename: file.name
                }]);
                setMessage({ type: 'success', text: 'Image uploaded successfully!' });
              } else {
                setMessage({ type: 'error', text: result.error || 'Failed to upload image' });
              }
            } catch (err) {
              setMessage({ type: 'error', text: 'Failed to parse upload response' });
            }
          } else {
            setMessage({ type: 'error', text: `Upload failed with status: ${xhr.status}` });
          }
          setIsUploading(false);
          setUploadProgress(0);
        });

        xhr.addEventListener('error', () => {
          setMessage({ type: 'error', text: 'Upload failed' });
          setIsUploading(false);
          setUploadProgress(0);
        });

        xhr.open('POST', '/api/wordpress/upload');
        xhr.send(formData);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
        setMessage({ type: 'error', text: errorMessage });
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleInlineImageUpload = () => {
    if (inlineImageInputRef.current) {
      inlineImageInputRef.current.click();
    }
  };

  const handleInlineImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedSite) {
      setIsUploadingInlineImage(true);
      setInlineUploadProgress(0);
      setMessage(null);

      try {
        const formData = new FormData();
        formData.append('siteId', selectedSite);
        formData.append('file', file);

        // Use XMLHttpRequest to track progress
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setInlineUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              if (result.success) {
                // Insert as WordPress <figure> HTML block
                const textarea = document.getElementById('content') as HTMLTextAreaElement;
                const cursorPos = textarea.selectionStart;
                const text = textarea.value;
                const before = text.substring(0, cursorPos);
                const after = text.substring(cursorPos);
                const caption = result.data.title || file.name;
                const figureHtml = `<figure class=\"wp-block-image size-full\"><img src=\"${result.data.url}\" alt=\"\" class=\"wp-image-${result.data.id}\"/><figcaption class=\"wp-element-caption\">${caption}</figcaption></figure>`;
                setContent(before + figureHtml + after);

                // Add to media library
                setMediaLibrary(prev => [...prev, {
                  id: result.data.id,
                  url: result.data.url,
                  alt_text: result.data.alt_text || file.name,
                  title: result.data.title || file.name,
                  filename: file.name
                }]);

                setMessage({ type: 'success', text: 'Image uploaded and inserted!' });
              } else {
                setMessage({ type: 'error', text: result.error || 'Failed to upload image' });
              }
            } catch (err) {
              setMessage({ type: 'error', text: 'Failed to parse upload response' });
            }
          } else {
            setMessage({ type: 'error', text: `Upload failed with status: ${xhr.status}` });
          }
          setIsUploadingInlineImage(false);
          setInlineUploadProgress(0);
          // Clear the file input
          if (inlineImageInputRef.current) {
            inlineImageInputRef.current.value = '';
          }
        });

        xhr.addEventListener('error', () => {
          setMessage({ type: 'error', text: 'Upload failed' });
          setIsUploadingInlineImage(false);
          setInlineUploadProgress(0);
          // Clear the file input
          if (inlineImageInputRef.current) {
            inlineImageInputRef.current.value = '';
          }
        });

        xhr.open('POST', '/api/wordpress/upload');
        xhr.send(formData);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
        setMessage({ type: 'error', text: errorMessage });
        setIsUploadingInlineImage(false);
        setInlineUploadProgress(0);
        // Clear the file input
        if (inlineImageInputRef.current) {
          inlineImageInputRef.current.value = '';
        }
      }
    }
  };

  // Select image from media library for featured image
  const selectFeaturedImage = (image: UploadedImage) => {
    setUploadedImage(image);
    setShowMediaLibrary(false);
    setMessage({ type: 'success', text: 'Featured image selected!' });
  };

  // Insert image from media library into content
  const insertImageFromLibrary = (image: UploadedImage) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart;
    const text = textarea.value;
    const before = text.substring(0, cursorPos);
    const after = text.substring(cursorPos);
    // Insert as WordPress <figure> HTML block
    const caption = image.title || image.filename || '';
    const figureHtml = `<figure class="wp-block-image size-full"><img src="${image.url}" alt="" class="wp-image-${image.id}"/><figcaption class="wp-element-caption">${caption}</figcaption></figure>`;
    setContent(before + figureHtml + after);
    setShowMediaLibrary(false);
    setMessage({ type: 'success', text: 'Image inserted into content!' });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedSite || !selectedAuthor || !title || !content) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const postData = {
        siteId: selectedSite,
        authorId: selectedAuthor,
        title,
        content,
        featuredImageId: uploadedImage?.id || null,
        template: selectedTemplate,
        categories: selectedCategories,
        status: 'draft'
      };

      const response = await fetch('/api/wordpress/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Post created successfully! View it at: ${result.post_url}` 
        });
        // Reset form
        setTitle("");
        setContent("");
        setUploadedImage(null);
        setSelectedTemplate("");
        setSelectedCategories([]);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create post' });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          ← Back to Dashboard
        </Button>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site and Author Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Site & Author</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site">WordPress Site *</Label>
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Select value={selectedAuthor} onValueChange={setSelectedAuthor} disabled={!selectedSite || isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading..." : "Select an author"} />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={String(author.id)}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Categories Selection */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 col-span-full">
                    {isLoading ? "Loading categories..." : "No categories available"}
                  </p>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`category-${category.id}`} className="text-sm">
                        {category.name} ({category.count})
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post Content */}
        <Card>
          <CardHeader>
            <CardTitle>Post Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Content *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                >
                  {isPreviewMode ? 'Edit' : 'Preview'}
                </Button>
              </div>
              
              {isPreviewMode ? (
                <div className="border rounded-md p-4 min-h-[300px] bg-white">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                  />
                </div>
              ) : (
                <div className="border rounded-md">
                  <div className="border-b p-2 bg-gray-50 flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const before = text.substring(0, start);
                        const selection = text.substring(start, end);
                        const after = text.substring(end);
                        setContent(before + `**${selection}**` + after);
                      }}
                    >
                      Bold
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const before = text.substring(0, start);
                        const selection = text.substring(start, end);
                        const after = text.substring(end);
                        setContent(before + `*${selection}*` + after);
                      }}
                    >
                      Italic
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const before = text.substring(0, start);
                        const selection = text.substring(start, end);
                        const after = text.substring(end);
                        setContent(before + `<span style='font-size: 24px'>${selection}</span>` + after);
                      }}
                    >
                      Large Text
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const before = text.substring(0, start);
                        const selection = text.substring(start, end);
                        const after = text.substring(end);
                        setContent(before + `<span style='font-size: 14px'>${selection}</span>` + after);
                      }}
                    >
                      Small Text
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleInlineImageUpload}
                      disabled={!selectedSite || isLoading || isUploadingInlineImage}
                    >
                      {isUploadingInlineImage ? `Uploading ${inlineUploadProgress}%` : 'Add Image'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMediaLibrary(true)}
                      disabled={!selectedSite}
                    >
                      Media Library
                    </Button>
                    {isUploadingInlineImage && (
                      <div className="flex-1 ml-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-green-600 h-1 rounded-full transition-all duration-300" 
                            style={{ width: `${inlineUploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                    placeholder="Write your post content here... Use markdown for formatting."
                    rows={12}
                    className="border-0 resize-none"
                    required
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="featured-image">Featured Image</Label>
                <div className="flex justify-between items-center">
                  <Input
                    id="featured-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={!selectedSite || isLoading || isUploading}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMediaLibrary(true)}
                      disabled={!selectedSite}
                    >
                      Media Library ({mediaLibrary.length})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('featured-image')?.click()}
                      disabled={!selectedSite || isLoading || isUploading}
                    >
                      Upload New
                    </Button>
                  </div>
                </div>
                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Uploading: {uploadProgress}%</div>
                  </div>
                )}
                {!selectedSite && (
                  <p className="text-sm text-gray-500">Please select a site first</p>
                )}
              </div>
              {uploadedImage && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Uploaded image: {uploadedImage.title}</p>
                  <div className="relative w-64 h-48">
                    <Image
                      src={uploadedImage.url}
                      alt={uploadedImage.alt_text}
                      fill
                      className="object-cover rounded border"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Post Template */}
        <Card>
          <CardHeader>
            <CardTitle>Post Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="template">Select Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {postTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Post...' : 'Create Post'}
          </Button>
        </div>
      </form>

      {/* Hidden file input for inline image uploads */}
      <input
        type="file"
        ref={inlineImageInputRef}
        onChange={handleInlineImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Media Library</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMediaLibrary(false)}
              >
                ✕
              </Button>
            </div>
            
            {isLoadingMedia ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading media library...</div>
              </div>
            ) : mediaLibrary.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No images in media library</div>
                <div className="text-sm text-gray-400 mt-2">Upload some images first</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
                {mediaLibrary.map((image) => (
                  <div
                    key={image.id}
                    className="border rounded-lg p-2 cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => insertImageFromLibrary(image)}
                  >
                    <div className="relative aspect-square mb-2">
                      <Image
                        src={image.url}
                        alt={image.alt_text || image.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="text-xs text-gray-600 truncate" title={image.title}>
                      {image.title || image.filename}
                    </div>
                    <div className="text-xs text-gray-400">
                      {image.width} × {image.height}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowMediaLibrary(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => document.getElementById('featured-image')?.click()}
                disabled={!selectedSite}
              >
                Upload New Image
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 