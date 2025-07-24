import { z } from 'zod';

/**
 * Zod validation schemas for WordPress configuration
 * Ensures type safety and data validation across the application
 */

// URL validation schema
const urlSchema = z.string().url('Invalid URL format');

// Site credentials validation
export const siteCredentialsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  jwtSecret: z.string().min(10, 'JWT Secret must be at least 10 characters')
});

// Site status validation
export const siteStatusSchema = z.enum(['online', 'offline', 'maintenance', 'error', 'checking']);

// WordPress site validation
export const wordPressSiteSchema = z.object({
  id: z.string().min(1, 'Site ID is required'),
  name: z.string().min(1, 'Site name is required'),
  url: urlSchema,
  apiUrl: urlSchema,
  credentials: siteCredentialsSchema,
  status: siteStatusSchema.optional(),
  lastChecked: z.date().optional(),
  version: z.string().optional(),
  theme: z.string().optional(),
  plugins: z.number().optional()
});

// Rate limit configuration validation
export const rateLimitSchema = z.object({
  requestsPerMinute: z.number().min(1).max(1000, 'Rate limit cannot exceed 1000 requests per minute')
});

// JWT configuration validation
export const jwtConfigSchema = z.object({
  secret: z.string().min(32, 'JWT secret must be at least 32 characters'),
  expirationTime: z.string().regex(/^\d+[dhms]$/, 'Invalid expiration time format (e.g., 24h, 7d)')
});

// Encryption configuration validation
export const encryptionConfigSchema = z.object({
  key: z.string().length(32, 'Encryption key must be exactly 32 characters')
});

// Complete WordPress configuration validation
export const wordPressConfigSchema = z.object({
  sites: z.array(wordPressSiteSchema).min(1, 'At least one WordPress site must be configured'),
  rateLimit: rateLimitSchema,
  jwt: jwtConfigSchema,
  encryption: encryptionConfigSchema
});

// Environment variable validation schemas
export const envVarSchema = z.object({
  // WordPress Site 1
  WORDPRESS_SITE_1_NAME: z.string().optional(),
  WORDPRESS_SITE_1_URL: z.string().url().optional(),
  WORDPRESS_SITE_1_API_URL: z.string().url().optional(),
  WORDPRESS_SITE_1_USERNAME: z.string().optional(),
  WORDPRESS_SITE_1_PASSWORD: z.string().optional(),
  WORDPRESS_SITE_1_JWT_SECRET: z.string().optional(),

  // WordPress Site 2
  WORDPRESS_SITE_2_NAME: z.string().optional(),
  WORDPRESS_SITE_2_URL: z.string().url().optional(),
  WORDPRESS_SITE_2_API_URL: z.string().url().optional(),
  WORDPRESS_SITE_2_USERNAME: z.string().optional(),
  WORDPRESS_SITE_2_PASSWORD: z.string().optional(),
  WORDPRESS_SITE_2_JWT_SECRET: z.string().optional(),

  // WordPress Site 3
  WORDPRESS_SITE_3_NAME: z.string().optional(),
  WORDPRESS_SITE_3_URL: z.string().url().optional(),
  WORDPRESS_SITE_3_API_URL: z.string().url().optional(),
  WORDPRESS_SITE_3_USERNAME: z.string().optional(),
  WORDPRESS_SITE_3_PASSWORD: z.string().optional(),
  WORDPRESS_SITE_3_JWT_SECRET: z.string().optional(),

  // WordPress Site 4
  WORDPRESS_SITE_4_NAME: z.string().optional(),
  WORDPRESS_SITE_4_URL: z.string().url().optional(),
  WORDPRESS_SITE_4_API_URL: z.string().url().optional(),
  WORDPRESS_SITE_4_USERNAME: z.string().optional(),
  WORDPRESS_SITE_4_PASSWORD: z.string().optional(),
  WORDPRESS_SITE_4_JWT_SECRET: z.string().optional(),

  // WordPress Site 5
  WORDPRESS_SITE_5_NAME: z.string().optional(),
  WORDPRESS_SITE_5_URL: z.string().url().optional(),
  WORDPRESS_SITE_5_API_URL: z.string().url().optional(),
  WORDPRESS_SITE_5_USERNAME: z.string().optional(),
  WORDPRESS_SITE_5_PASSWORD: z.string().optional(),
  WORDPRESS_SITE_5_JWT_SECRET: z.string().optional(),

  // Application configuration
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION_TIME: z.string().default('24h'),
  API_RATE_LIMIT_REQUESTS_PER_MINUTE: z.string().transform(Number).pipe(z.number().min(1).max(1000)).default(60),
  ENCRYPTION_KEY: z.string().length(32),

  // Optional
  DATABASE_URL: z.string().optional(),
});

// WordPress API response validation schemas
export const wordPressPostSchema = z.object({
  id: z.number(),
  date: z.string(),
  date_gmt: z.string(),
  guid: z.object({
    rendered: z.string()
  }),
  modified: z.string(),
  modified_gmt: z.string(),
  slug: z.string(),
  status: z.enum(['publish', 'future', 'draft', 'pending', 'private']),
  type: z.string(),
  link: z.string(),
  title: z.object({
    rendered: z.string()
  }),
  content: z.object({
    rendered: z.string(),
    protected: z.boolean()
  }),
  excerpt: z.object({
    rendered: z.string(),
    protected: z.boolean()
  }),
  author: z.number(),
  featured_media: z.number(),
  comment_status: z.enum(['open', 'closed']),
  ping_status: z.enum(['open', 'closed']),
  sticky: z.boolean(),
  template: z.string(),
  format: z.string(),
  meta: z.record(z.string(), z.any()),
  categories: z.array(z.number()),
  tags: z.array(z.number())
});

export const wordPressUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  url: z.string(),
  description: z.string(),
  link: z.string(),
  locale: z.string(),
  nickname: z.string(),
  slug: z.string(),
  roles: z.array(z.string()),
  capabilities: z.record(z.string(), z.boolean()),
  extra_capabilities: z.record(z.string(), z.boolean()),
  avatar_urls: z.record(z.string(), z.string()),
  meta: z.record(z.string(), z.any())
});

export const wordPressPluginSchema = z.object({
  plugin: z.string(),
  status: z.enum(['active', 'inactive']),
  name: z.string(),
  plugin_uri: z.string(),
  version: z.string(),
  description: z.string(),
  author: z.string(),
  author_uri: z.string(),
  text_domain: z.string(),
  domain_path: z.string(),
  network: z.boolean(),
  title: z.string(),
  author_name: z.string()
});

// Health check validation
export const siteHealthCheckSchema = z.object({
  siteId: z.string(),
  status: siteStatusSchema,
  responseTime: z.number(),
  lastChecked: z.date(),
  error: z.string().optional(),
  wordpressVersion: z.string().optional(),
  phpVersion: z.string().optional(),
  mysqlVersion: z.string().optional(),
  themes: z.object({
    active: z.string(),
    total: z.number()
  }).optional(),
  plugins: z.object({
    active: z.number(),
    total: z.number(),
    needsUpdate: z.number()
  }).optional(),
  updates: z.object({
    core: z.boolean(),
    themes: z.number(),
    plugins: z.number()
  }).optional()
});

// Utility functions for validation
export function validateWordPressConfig(config: unknown) {
  return wordPressConfigSchema.parse(config);
}

export function validateSite(site: unknown) {
  return wordPressSiteSchema.parse(site);
}

export function validateEnvironmentVariables(env: unknown) {
  return envVarSchema.parse(env);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidWordPressApiUrl(url: string): boolean {
  return isValidUrl(url) && url.includes('/wp-json/wp/v2');
} 