# Security Enhancements

This document outlines the security measures implemented in the NuCalc API backend.

## Critical Security Fixes

### 1. Safe Expression Evaluation
**Problem**: Previously used unsafe `eval()` which allowed arbitrary code execution.

**Solution**: Implemented `safe_calculate()` helper with:
- Whitelist validation (only numbers and basic operators allowed)
- Parentheses balance checking
- Division by zero prevention
- Expression length limiting (max 200 characters)
- Result validation (checks for infinity, NaN)
- Proper error handling

### 2. Secure JWT Secret Management
**Problem**: Hardcoded default JWT secret in production.

**Solution**:
- Requires `JWT_SECRET` environment variable in production
- Raises error if not set in production environment
- Only allows default secret in development with warning

### 3. CORS Configuration
**Problem**: Allowed all origins (`*`) in production.

**Solution**:
- Now requires explicit origin configuration via `ALLOWED_ORIGINS` environment variable
- Default allows only `http://localhost:4260` for development
- Supports multiple origins (comma-separated)
- Sets proper credentials and max-age headers

### 4. Input Validation
Implemented comprehensive input validation on all endpoints:

#### Authentication Endpoints
- Email format validation with regex
- Password length requirements (8-128 characters)
- Type checking for all inputs
- Email normalization (lowercase, trimmed)

#### Calculation Endpoint
- Expression presence and type validation
- Empty string prevention
- Safe calculation with multiple security checks

#### Preferences Endpoint
- Theme whitelist validation
- Precision range validation (0-10)
- Type checking

## Environment Variables

### Required for Production

```bash
# JWT Secret - MUST be a strong, random string
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Allowed CORS Origins - comma-separated list
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# MongoDB Connection (configured in config/mongoid.yml)
MONGODB_URI=mongodb://username:password@host:port/database
```

### Generating a Secure JWT Secret

```bash
# Using OpenSSL
openssl rand -hex 32

# Using Ruby
ruby -e "require 'securerandom'; puts SecureRandom.hex(32)"
```

## Additional Security Recommendations

### For Production Deployment

1. **Rate Limiting**: Implement rate limiting to prevent abuse
   ```ruby
   # Add to Gemfile
   gem 'rack-attack'
   ```

2. **HTTPS Only**: Always use HTTPS in production
   - Set `force_ssl` in production environment
   - Use secure cookies for sessions

3. **Database Security**:
   - Use MongoDB authentication
   - Enable TLS/SSL for MongoDB connections
   - Restrict database user permissions

4. **Logging & Monitoring**:
   - Log all authentication attempts
   - Monitor for suspicious patterns
   - Set up error tracking (e.g., Sentry)

5. **Dependency Updates**:
   ```bash
   # Regular security updates
   bundle audit
   bundle update
   ```

6. **Additional Headers**:
   ```ruby
   # Add security headers
   use Rack::Protection
   use Rack::Protection::StrictTransport
   ```

7. **Consider a Math Parser Library**:
   For even better security, replace the validated `eval` with a dedicated math parser:
   ```ruby
   # Add to Gemfile
   gem 'dentaku'

   # Usage
   calculator = Dentaku::Calculator.new
   result = calculator.evaluate(expression)
   ```

## Security Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET` environment variable
- [ ] Configure `ALLOWED_ORIGINS` for your domain(s)
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS/TLS for all connections
- [ ] Implement rate limiting
- [ ] Set up error tracking and monitoring
- [ ] Review and audit all dependencies
- [ ] Enable database backups
- [ ] Configure proper firewall rules
- [ ] Set up logging for security events

## Reporting Security Issues

If you discover a security vulnerability, please email security@nucalc.com (or create a private security advisory on GitHub).

Do **NOT** create public GitHub issues for security vulnerabilities.

## License

This security documentation is part of the NuCalc project and is licensed under the MIT License.
