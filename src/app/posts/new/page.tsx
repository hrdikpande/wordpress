"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, Upload, Image as ImageIcon, Eye, Edit, Save, Loader2, CheckCircle, AlertCircle, X, Plus } from "lucide-react";
import { NavigationHeader } from "@/components/ui/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-background">
      <NavigationHeader title="Create New Post" />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 md-animate-fade-in">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.history.back()}
            className="md-state-layer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="md-headline-medium font-bold text-foreground">Create New Post</h1>
            <p className="md-body-medium text-muted-foreground">
              Craft and publish content across your WordPress sites
            </p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <Alert className={`mb-6 md-animate-scale-in ${
            message.type === 'error' 
              ? 'border-red-500/50 bg-red-50 dark:bg-red-900/10' 
              : 'border-green-500/50 bg-green-50 dark:bg-green-900/10'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
              <AlertDescription className={`md-body-medium ${
                message.type === 'error' 
                  ? 'text-red-700 dark:text-red-300' 
                  : 'text-green-700 dark:text-green-300'
              }`}>
                {message.text}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Site and Author Selection */}
          <Card className="md-card md-animate-fade-in">
            <CardHeader>
              <CardTitle className="md-title-large flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">1</span>
                </div>
                Site & Author Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="site" className="md-label-large">WordPress Site *</Label>
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger className="md-text-field">
                      <SelectValue placeholder="Choose your WordPress site" />
                    </SelectTrigger>
                    <SelectContent className="md-surface md-elevation-2">
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id} className="md-body-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {site.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {site.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="author" className="md-label-large">Author *</Label>
                  <Select value={selectedAuthor} onValueChange={setSelectedAuthor} disabled={!selectedSite || isLoading}>
                    <SelectTrigger className="md-text-field">
                      <SelectValue placeholder={isLoading ? "Loading authors..." : "Select post author"} />
                    </SelectTrigger>
                    <SelectContent className="md-surface md-elevation-2">
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={String(author.id)} className="md-body-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {author.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div>{author.name}</div>
                              <div className="text-xs text-muted-foreground">{author.email}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Categories Selection */}
              <div className="space-y-3">
                <Label className="md-label-large">Categories</Label>
                <div className="border rounded-xl p-4 bg-muted/30">
                  {categories.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="md-body-medium text-muted-foreground">
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading categories...
                          </span>
                        ) : (
                          "No categories available"
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                          className={`cursor-pointer md-chip transition-all duration-200 ${
                            selectedCategories.includes(category.id) ? 'selected' : ''
                          }`}
                          onClick={() => {
                            if (selectedCategories.includes(category.id)) {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                            } else {
                              setSelectedCategories([...selectedCategories, category.id]);
                            }
                          }}
                        >
                          {category.name} ({category.count})
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post Content */}
          <Card className="md-card md-animate-fade-in">
            <CardHeader>
              <CardTitle className="md-title-large flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">2</span>
                </div>
                Post Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="md-label-large">Post Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter an engaging post title..."
                  required
                  className="md-text-field text-lg"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="content" className="md-label-large">Content *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="md-outlined-button gap-2"
                  >
                    {isPreviewMode ? (
                      <>
                        <Edit className="h-4 w-4" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>
                
                {isPreviewMode ? (
                  <div className="border rounded-xl p-6 min-h-[400px] bg-card md-elevation-1">
                    <div 
                      className="prose max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                    />
                  </div>
                ) : (
                  <div className="border rounded-xl overflow-hidden md-elevation-1">
                    <div className="border-b p-3 bg-muted/50 flex flex-wrap gap-2">
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
                        className="md-text-button text-xs"
                      >
                        <strong>B</strong>
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
                        className="md-text-button text-xs italic"
                      >
                        I
                      </Button>
                      <div className="w-px h-6 bg-border" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleInlineImageUpload}
                        disabled={!selectedSite || isLoading || isUploadingInlineImage}
                        className="md-text-button gap-1 text-xs"
                      >
                        {isUploadingInlineImage ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            {inlineUploadProgress}%
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-3 w-3" />
                            Image
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMediaLibrary(true)}
                        disabled={!selectedSite}
                        className="md-text-button gap-1 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        Media ({mediaLibrary.length})
                      </Button>
                    </div>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                      placeholder="Write your post content here... Use markdown for formatting."
                      rows={16}
                      className="border-0 resize-none rounded-none focus:ring-0"
                      required
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card className="md-card md-animate-fade-in">
            <CardHeader>
              <CardTitle className="md-title-large flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-sm font-bold">3</span>
                </div>
                Featured Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="featured-image" className="md-label-large">Choose Featured Image</Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      id="featured-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={!selectedSite || isLoading || isUploading}
                      className="md-text-field flex-1"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMediaLibrary(true)}
                        disabled={!selectedSite}
                        className="md-outlined-button gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Library ({mediaLibrary.length})
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('featured-image')?.click()}
                        disabled={!selectedSite || isLoading || isUploading}
                        className="md-outlined-button gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="md-linear-progress">
                        <div 
                          className="md-linear-progress-bar" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="md-body-small text-muted-foreground">
                        Uploading: {uploadProgress}%
                      </div>
                    </div>
                  )}
                  
                  {!selectedSite && (
                    <p className="md-body-small text-muted-foreground">
                      Please select a WordPress site first
                    </p>
                  )}
                </div>
                
                {uploadedImage && (
                  <div className="space-y-3">
                    <Label className="md-label-medium">Selected Image</Label>
                    <div className="relative w-full max-w-md">
                      <Image
                        src={uploadedImage.url}
                        alt={uploadedImage.alt_text}
                        width={400}
                        height={300}
                        className="object-cover rounded-xl border md-elevation-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="md-body-small text-muted-foreground">
                      {uploadedImage.title}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Post Template */}
          <Card className="md-card md-animate-fade-in">
            <CardHeader>
              <CardTitle className="md-title-large flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">4</span>
                </div>
                Post Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="template" className="md-label-large">Template Style</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="md-text-field">
                    <SelectValue placeholder="Choose a template style" />
                  </SelectTrigger>
                  <SelectContent className="md-surface md-elevation-2">
                    {postTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id} className="md-body-medium">
                        <div className="py-2">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 md-animate-fade-in">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.history.back()}
              className="md-outlined-button"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="md-filled-button gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Post...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Post
                </>
              )}
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 max-w-5xl w-full max-h-[85vh] overflow-hidden md-elevation-5 md-animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="md-title-large font-semibold">Media Library</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMediaLibrary(false)}
                  className="md-state-layer"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {isLoadingMedia ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <div className="md-body-medium text-muted-foreground">Loading media library...</div>
                </div>
              ) : mediaLibrary.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="md-title-medium font-semibold text-foreground mb-2">No images in media library</div>
                  <div className="md-body-medium text-muted-foreground">Upload some images to get started</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto">
                  {mediaLibrary.map((image) => (
                    <div
                      key={image.id}
                      className="border rounded-xl p-3 cursor-pointer hover:border-primary transition-all duration-200 md-state-layer md-card"
                      onClick={() => insertImageFromLibrary(image)}
                    >
                      <div className="relative aspect-square mb-3">
                        <Image
                          src={image.url}
                          alt={image.alt_text || image.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="md-body-small text-foreground truncate font-medium" title={image.title}>
                        {image.title || image.filename}
                      </div>
                      <div className="md-label-small text-muted-foreground">
                        {image.width} × {image.height}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowMediaLibrary(false)}
                  className="md-outlined-button"
                >
                  Close
                </Button>
                <Button
                  onClick={() => document.getElementById('featured-image')?.click()}
                  disabled={!selectedSite}
                  className="md-filled-button gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload New Image
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 