# WordPress Sites Configuration Guide

This guide explains how to configure your WordPress Management Website to connect to multiple WordPress sites securely.

## 🔧 Environment Setup

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Configure WordPress Sites

Edit `.env.local` and update the following sections for each of your WordPress sites:

```env
# Site 1 - Production Site
WORDPRESS_SITE_1_NAME="Your Production Site Name"
WORDPRESS_SITE_1_URL="https://yoursite.com"
WORDPRESS_SITE_1_API_URL="https://yoursite.com/wp-json/wp/v2"
WORDPRESS_SITE_1_USERNAME="your_wp_username"
WORDPRESS_SITE_1_PASSWORD="your_application_password"
WORDPRESS_SITE_1_JWT_SECRET="your_unique_jwt_secret_here"
```

Repeat for sites 2-5 as needed.

## 🔐 Security Configuration

### Required Security Keys

Generate secure keys for the following:

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_32_character_nextauth_secret"

# JWT Configuration
JWT_SECRET="your_64_character_jwt_secret_for_app"
JWT_EXPIRATION_TIME="24h"

# Encryption Key (exactly 32 characters)
ENCRYPTION_KEY="your_32_character_encryption_key_here"
```

### Generate Secure Keys

Use the built-in key generator:

```bash
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

## 🔑 WordPress Application Passwords

For each WordPress site, you need to create Application Passwords:

### 1. WordPress Admin Dashboard
1. Go to **Users** → **Your Profile**
2. Scroll to **Application Passwords** section
3. Enter application name: "WordPress Management Dashboard"
4. Click **Add New Application Password**
5. Copy the generated password (you won't see it again!)

### 2. Test API Access

Verify your configuration works:

```bash
curl -u "username:application_password" \
  "https://yoursite.com/wp-json/wp/v2/users/me"
```

## 🌐 WordPress REST API Requirements

### Enable REST API

Ensure the WordPress REST API is enabled on all your sites:

1. **WordPress Version**: 4.7+ (REST API is built-in)
2. **Permalinks**: Must be enabled (not "Plain")
3. **HTTPS**: Recommended for production sites

### Required Endpoints

The management dashboard uses these WordPress REST API endpoints:

- `/wp-json/wp/v2/posts` - Posts management
- `/wp-json/wp/v2/users` - User management  
- `/wp-json/wp/v2/media` - Media library
- `/wp-json/wp/v2/plugins` - Plugin management (requires plugin)
- `/wp-json/wp/v2/themes` - Theme management (requires plugin)

### Optional: Install WordPress Management Plugin

For advanced features (plugin/theme management), install our companion plugin:

```php
// Will be provided in future updates
```

## 📊 Rate Limiting

Configure API rate limiting to prevent overwhelming your WordPress sites:

```env
API_RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

## 🗄️ Database Configuration (Optional)

For local user management and caching:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wp_management"
```

## ✅ Configuration Validation

The system automatically validates your configuration on startup. Check the console for any errors:

```bash
npm run dev
```

### Common Issues

1. **Invalid URLs**: Ensure URLs include `https://` or `http://`
2. **API URL Format**: Must end with `/wp-json/wp/v2`
3. **Key Length**: Encryption key must be exactly 32 characters
4. **Missing Variables**: All required environment variables must be set

## 🧪 Testing Configuration

### Health Check

Test all configured sites:

```bash
# Will be available in next development phase
curl http://localhost:3000/api/health-check
```

### Configuration Summary

View configuration summary (without sensitive data):

```bash
# In your app console, you'll see:
# - Sites count
# - Configured sites
# - Security status
```

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env.local` to version control
- Use different keys for development/staging/production
- Rotate keys regularly

### WordPress Security
- Use strong Application Passwords
- Limit API user permissions
- Enable two-factor authentication
- Keep WordPress updated

### Network Security
- Use HTTPS for all production sites
- Consider IP whitelisting for sensitive sites
- Use firewall rules to protect WordPress admin

## 🛠️ Troubleshooting

### Connection Issues

1. **Test WordPress site directly**:
   ```bash
   curl https://yoursite.com/wp-json/wp/v2/
   ```

2. **Verify credentials**:
   ```bash
   curl -u "username:app_password" https://yoursite.com/wp-json/wp/v2/users/me
   ```

3. **Check CORS settings** (if needed):
   Add to WordPress `functions.php`:
   ```php
   add_action('rest_api_init', function() {
       remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
       add_filter('rest_pre_serve_request', function($value) {
           header('Access-Control-Allow-Origin: http://localhost:3000');
           header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
           header('Access-Control-Allow-Headers: Authorization, Content-Type');
           return $value;
       });
   });
   ```

### Configuration Errors

Check the application logs for detailed error messages:
- Invalid URL formats
- Missing required fields
- Authentication failures
- API endpoint accessibility

## 📋 Configuration Checklist

- [ ] Copied `.env.example` to `.env.local`
- [ ] Updated all WordPress site details
- [ ] Generated secure keys (32+ characters each)
- [ ] Created WordPress Application Passwords
- [ ] Tested API connectivity
- [ ] Verified site health checks
- [ ] Secured environment file permissions
- [ ] Documented site-specific notes

---

Your WordPress Management Website is now configured! 🚀 