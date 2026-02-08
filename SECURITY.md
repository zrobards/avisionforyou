# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| Latest  | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email us at: **info@avisionforyourecovery.org**

Include the following in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Resolution**: Dependent on severity, typically within 30 days

## Security Measures

This application implements the following security measures:

- Input sanitization on all form submissions
- Rate limiting on all API endpoints
- Content Security Policy (CSP) headers
- HSTS, X-Frame-Options, and other security headers
- bcrypt password hashing with salt
- JWT session tokens with expiry
- Server-side role-based access control
- Encrypted storage of sensitive assessment data
- HMAC signature verification for payment webhooks
- DOMPurify sanitization for user-generated content

## Contact

A Vision For You Inc.
1675 Story Ave, Louisville, KY 40206
(502) 749-6344
info@avisionforyourecovery.org
