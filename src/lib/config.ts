import { WordPressSite, WordPressConfig, SiteCredentials } from '@/types/wordpress';

/**
 * WordPress Sites Configuration Manager
 * Loads site configurations from environment variables securely
 */

// Validate environment variables
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'JWT_SECRET',
  'ENCRYPTION_KEY'
];

function validateEnvironment(): void {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate encryption key length
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }
}

/**
 * Load credentials for a specific site from environment variables
 */
function loadSiteCredentials(siteNumber: number): SiteCredentials | null {
  const username = process.env[`WORDPRESS_SITE_${siteNumber}_USERNAME`];
  const password = process.env[`WORDPRESS_SITE_${siteNumber}_PASSWORD`];
  const jwtSecret = process.env[`WORDPRESS_SITE_${siteNumber}_JWT_SECRET`];

  if (!username || !password || !jwtSecret) {
    return null;
  }

  return {
    username,
    password,
    jwtSecret
  };
}

/**
 * Load a single WordPress site configuration
 */
function loadSiteConfig(siteNumber: number): WordPressSite | null {
  const name = process.env[`WORDPRESS_SITE_${siteNumber}_NAME`];
  const url = process.env[`WORDPRESS_SITE_${siteNumber}_URL`];
  const apiUrl = process.env[`WORDPRESS_SITE_${siteNumber}_API_URL`];
  
  if (!name || !url || !apiUrl) {
    return null;
  }

  const credentials = loadSiteCredentials(siteNumber);
  if (!credentials) {
    return null;
  }

  return {
    id: `site_${siteNumber}`,
    name,
    url,
    apiUrl,
    credentials,
    status: 'checking',
    lastChecked: new Date()
  };
}

/**
 * Load all WordPress site configurations
 */
export function loadWordPressSites(): WordPressSite[] {
  const sites: WordPressSite[] = [];
  
  // Load up to 5 sites (expandable)
  for (let i = 1; i <= 5; i++) {
    const site = loadSiteConfig(i);
    if (site) {
      sites.push(site);
    }
  }

  return sites;
}

/**
 * Load complete WordPress configuration
 */
export function loadWordPressConfig(): WordPressConfig {
  // Validate environment first
  validateEnvironment();

  const sites = loadWordPressSites();
  
  if (sites.length === 0) {
    console.warn('No WordPress sites configured. Please check your environment variables.');
  }

  return {
    sites,
    rateLimit: {
      requestsPerMinute: parseInt(process.env.API_RATE_LIMIT_REQUESTS_PER_MINUTE || '60', 10)
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      expirationTime: process.env.JWT_EXPIRATION_TIME || '24h'
    },
    encryption: {
      key: process.env.ENCRYPTION_KEY!
    }
  };
}

/**
 * Get a specific site configuration by ID
 */
export function getSiteById(siteId: string): WordPressSite | undefined {
  const config = loadWordPressConfig();
  return config.sites.find(site => site.id === siteId);
}

/**
 * Get all configured site IDs
 */
export function getAllSiteIds(): string[] {
  const config = loadWordPressConfig();
  return config.sites.map(site => site.id);
}

/**
 * Validate if a site is properly configured
 */
export function validateSiteConfig(site: WordPressSite): string[] {
  const errors: string[] = [];

  if (!site.name) errors.push('Site name is required');
  if (!site.url) errors.push('Site URL is required');
  if (!site.apiUrl) errors.push('API URL is required');
  if (!site.credentials.username) errors.push('Username is required');
  if (!site.credentials.password) errors.push('Password is required');
  if (!site.credentials.jwtSecret) errors.push('JWT Secret is required');

  // Validate URL format
  try {
    new URL(site.url);
  } catch {
    errors.push('Invalid site URL format');
  }

  try {
    new URL(site.apiUrl);
  } catch {
    errors.push('Invalid API URL format');
  }

  return errors;
}

/**
 * Get configuration summary for debugging (without sensitive data)
 */
export function getConfigSummary() {
  const config = loadWordPressConfig();
  
  return {
    sitesCount: config.sites.length,
    sites: config.sites.map(site => ({
      id: site.id,
      name: site.name,
      url: site.url,
      hasCredentials: !!site.credentials.username,
      status: site.status
    })),
    rateLimit: config.rateLimit,
    jwtConfigured: !!config.jwt.secret,
    encryptionConfigured: !!config.encryption.key
  };
} 