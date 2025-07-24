// WordPress Site Configuration Types

export interface WordPressSite {
  id: string;
  name: string;
  url: string;
  apiUrl: string;
  credentials: SiteCredentials;
  status?: SiteStatus;
  lastChecked?: Date;
  version?: string;
  theme?: string;
  plugins?: number;
}

export interface SiteCredentials {
  username: string;
  password: string; // Application Password
  jwtSecret: string;
}

export type SiteStatus = 'online' | 'offline' | 'maintenance' | 'error' | 'checking';

export interface WordPressConfig {
  sites: WordPressSite[];
  rateLimit: {
    requestsPerMinute: number;
  };
  jwt: {
    secret: string;
    expirationTime: string;
  };
  encryption: {
    key: string;
  };
}

// WordPress API Response Types
export interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, unknown>;
  categories: number[];
  tags: number[];
}

export interface WordPressUser {
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
}

export interface WordPressPlugin {
  plugin: string;
  status: 'active' | 'inactive';
  name: string;
  plugin_uri: string;
  version: string;
  description: string;
  author: string;
  author_uri: string;
  text_domain: string;
  domain_path: string;
  network: boolean;
  title: string;
  author_name: string;
}

export interface WordPressTheme {
  stylesheet: string;
  template: string;
  name: string;
  description: string;
  author: string;
  version: string;
  screenshot: string;
  tags: string[];
  template_files: string[];
  status: 'active' | 'inactive';
}

export interface SiteHealthCheck {
  siteId: string;
  status: SiteStatus;
  responseTime: number;
  lastChecked: Date;
  error?: string;
  wordpressVersion?: string;
  phpVersion?: string;
  mysqlVersion?: string;
  themes?: {
    active: string;
    total: number;
  };
  plugins?: {
    active: number;
    total: number;
    needsUpdate: number;
  };
  updates?: {
    core: boolean;
    themes: number;
    plugins: number;
  };
}

// API Response wrapper
export interface WordPressApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Configuration validation errors
export interface ConfigValidationError {
  field: string;
  message: string;
  siteId?: string;
} 